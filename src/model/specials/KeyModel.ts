import { unescapeKey } from 'shared/keypaths';
import { handleChange } from 'shared/methodCallers';
import { capture } from 'src/global/capture';
import Interpolator from 'src/view/items/Interpolator';
import Section from 'src/view/items/Section';
import ExpressionProxy from 'src/view/resolvers/ExpressionProxy';
import { addToArray, removeFromArray } from 'utils/array';
import noop from 'utils/noop';

import LinkModel from '../LinkModel';
import ModelBase from '../ModelBase';

type KeyModelValue = string | number;
type KeyModelDependency = Section | ExpressionProxy | Interpolator;

export default class KeyModel {
  public value: KeyModelValue;
  public key: KeyModelValue;

  /**
   * - RootModel
   * - Model
   * - LinkModel
   * - Model
   */
  public context: ModelBase;
  public instance: any; // TODO add ractive type here and in the constructor

  public deps: KeyModelDependency[] = [];
  public links: LinkModel[] = [];
  public children: KeyModel[] = [];
  public upstream: KeyModel;

  public isReadonly = true;
  public isKey = true;

  constructor(value: string | number, context?: ModelBase, instance?) {
    this.value = value;
    this.key = value;
    this.context = context;
    this.instance = instance;
  }

  reference = noop;
  unreference = noop;

  applyValue(value: KeyModelValue): void {
    if (value !== this.value) {
      this.value = this.key = value;
      this.deps.forEach(handleChange);
      this.links.forEach(handleChange);
      this.children.forEach(c => {
        c.applyValue(c.context.getKeypath(c.instance));
      });
    }
  }

  destroyed(): void {
    if (this.upstream) this.upstream.unregisterChild(this);
  }

  get(shouldCapture: boolean): KeyModelValue {
    if (shouldCapture) capture(this);
    return unescapeKey(this.value);
  }

  getKeypath(): KeyModelValue {
    return unescapeKey(this.value);
  }

  has(): boolean {
    return false;
  }

  rebind(next, previous): void {
    let i = this.deps.length;
    while (i--) this.deps[i].rebind(next, previous, false);

    i = this.links.length;
    while (i--) this.links[i].relinking(next, false);
  }

  register(dependant: KeyModelDependency): void {
    this.deps.push(dependant);
  }

  registerChild(child: KeyModel): void {
    addToArray(this.children, child);
    child.upstream = this;
  }

  registerLink(link: LinkModel): void {
    addToArray(this.links, link);
  }

  unregister(dependant: KeyModelDependency): void {
    removeFromArray(this.deps, dependant);
  }

  unregisterChild(child: KeyModel): void {
    removeFromArray(this.children, child);
  }

  unregisterLink(link: LinkModel): void {
    removeFromArray(this.links, link);
  }
}
