import Computation from 'model/Computation';
import type LinkModel from 'model/LinkModel';
import Model from 'model/Model';
import type ModelBase from 'model/ModelBase';
import type { ModelDependency } from 'model/ModelBase';
import type { ModelWithRebound } from 'model/ModelBase';
import type KeyModel from 'model/specials/KeyModel';
import type { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import getFunction from 'shared/getFunction';
import { rebindMatch } from 'shared/rebind';
import { startCapturing, stopCapturing } from 'src/global/capture';
import type { Keypath } from 'types/Generic';
import { removeFromArray } from 'utils/array';
import { warnIfDebug } from 'utils/log';
import noop from 'utils/noop';
import type Fragment from 'view/Fragment';
import type RepeatedFragment from 'view/RepeatedFragment';

import resolveReference from './resolveReference';

// todo add ModelWithRebound interface
export default class ExpressionProxy extends Model implements ModelWithRebound {
  private fragment: Fragment | RepeatedFragment;
  private template: ExpressionFunctionTemplateItem;
  public dirty: boolean;
  private fn: Function;
  private models: ModelBase[];
  /** Model | ExpressionProxy | KeyModel | LinkModel | RootModel | Computation | ComputationChild | ReferenceExpressionProxy | SharedModel | RactiveModel */
  public dependencies: (ModelBase | KeyModel)[];

  constructor(fragment: ExpressionProxy['fragment'], template: ExpressionProxy['template']) {
    super(fragment.ractive.viewmodel, null);

    this.fragment = fragment;
    this.template = template;

    this.isReadonly = true;
    this.isComputed = true;
    this.dirty = true;

    this.fn =
      fragment.ractive.allowExpressions === false
        ? noop
        : getFunction(template.s, template.r.length);

    this.models = this.template.r.map(ref => {
      return resolveReference(this.fragment, ref);
    });

    this.dependencies = [];

    this.shuffle = undefined;

    this.bubble();
  }

  bubble(actuallyChanged = true): void {
    // refresh the keypath
    this.keypath = undefined;

    if (actuallyChanged) {
      this.handleChange();
    }
  }

  getKeypath(): Keypath {
    if (!this.template) return '@undefined';
    if (!this.keypath) {
      this.keypath =
        '@' +
        this.template.s.replace(/_(\d+)/g, (match, i) => {
          if (i >= this.models.length) return match;

          const model = this.models[i];
          return model ? model.getKeypath() : '@undefined';
        });
    }

    return this.keypath;
  }

  getValue(): unknown {
    startCapturing();
    let result: unknown;

    try {
      const params = this.models.map(m => (m ? m.get(true) : undefined));
      result = this.fn.apply(this.fragment.ractive, params);
    } catch (err) {
      warnIfDebug(`Failed to compute ${this.getKeypath()}: ${err.message || err}`);
    }

    const dependencies = stopCapturing();
    // remove missing deps
    this.dependencies
      .filter(d => !~dependencies.indexOf(d))
      .forEach(d => {
        d.unregister(this);
        removeFromArray(this.dependencies, d);
      });
    // register new deps
    dependencies
      .filter(d => !~this.dependencies.indexOf(d))
      .forEach(d => {
        d.register(this);
        this.dependencies.push(d);
      });

    return result;
  }

  notifyUpstream(): void {}

  rebind(next: Model | LinkModel, previous: Model | LinkModel, safe: boolean): void {
    const idx = this.models.indexOf(previous);

    if (~idx) {
      next = rebindMatch(this.template.r[idx], next, previous);
      if (next !== previous) {
        previous.unregister(this);
        this.models.splice(idx, 1, next);
        if (next) next.addShuffleRegister(this, 'mark');
      }
    }
    this.bubble(!safe);
  }

  rebound(update: boolean): void {
    this.models = this.template.r.map(ref => resolveReference(this.fragment, ref));
    if (update) this.bubble(true);
  }

  retrieve(): unknown {
    return this.get();
  }

  teardown(): void {
    this.fragment = undefined;
    if (this.dependencies) this.dependencies.forEach(d => d.unregister(this));
    super.teardown();
  }

  unreference(): void {
    super.unreference();
    collect(this);
  }

  unregister(dep: ModelDependency): void {
    super.unregister(dep);
    collect(this);
  }

  unregisterLink(link: LinkModel): void {
    super.unregisterLink(link);
    collect(this);
  }

  get = Computation.prototype.get;
  handleChange = Computation.prototype.handleChange;
  joinKey = Computation.prototype.joinKey;
  mark = Computation.prototype.mark;
  unbind = noop;
}

// TSRChange - move below function inside class body
// const prototype = ExpressionProxy.prototype;
// const computation = Computation.prototype;
// prototype.get = computation.get;
// prototype.handleChange = computation.handleChange;
// prototype.joinKey = computation.joinKey;
// prototype.mark = computation.mark;
// prototype.unbind = noop;

function collect(model: ExpressionProxy): void {
  if (!model.deps.length && !model.refs && !model.links.length) model.teardown();
}
