import { unescapeKey } from 'shared/keypaths';
import { capture } from 'src/global/capture';
import { handleChange } from 'src/shared/methodCallers';
import { addToArray, removeFromArray } from 'utils/array';
import noop from 'utils/noop';

// TODO add correct typings

export default class KeyModel {
  public value: any;
  public key: any;
  public context: any;
  public instance: any;

  public isReadonly = true;
  public isKey = true;
  public deps = [];
  public links = [];
  public children = [];

  public upstream: any;

  constructor(value, context, instance) {
    this.value = value;
    this.key = value;
    this.context = context;
    this.instance = instance;
  }

  reference = noop;
  unreference = noop;

  applyValue(value) {
    if (value !== this.value) {
      this.value = this.key = value;
      this.deps.forEach(handleChange);
      this.links.forEach(handleChange);
      this.children.forEach(c => {
        c.applyValue(c.context.getKeypath(c.instance));
      });
    }
  }

  destroyed() {
    if (this.upstream) this.upstream.unregisterChild(this);
  }

  get(shouldCapture) {
    if (shouldCapture) capture(this);
    return unescapeKey(this.value);
  }

  getKeypath() {
    return unescapeKey(this.value);
  }

  has() {
    return false;
  }

  rebind(next, previous) {
    let i = this.deps.length;
    while (i--) this.deps[i].rebind(next, previous, false);

    i = this.links.length;
    while (i--) this.links[i].relinking(next, false);
  }

  register(dependant) {
    this.deps.push(dependant);
  }

  registerChild(child) {
    addToArray(this.children, child);
    child.upstream = this;
  }

  registerLink(link) {
    addToArray(this.links, link);
  }

  unregister(dependant) {
    removeFromArray(this.deps, dependant);
  }

  unregisterChild(child) {
    removeFromArray(this.children, child);
  }

  unregisterLink(link) {
    removeFromArray(this.links, link);
  }
}
