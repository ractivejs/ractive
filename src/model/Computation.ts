import { hasConsole } from 'config/environment';
import { capture, startCapturing, stopCapturing } from 'src/global/capture';
import runloop from 'src/global/runloop';
import type { ComputationSignature } from 'src/Ractive/helpers/getComputationSignature';
import type { Ractive, Static } from 'src/Ractive/RactiveDefinition';
import { isEqual } from 'utils/is';
import { warnIfDebug } from 'utils/log';

import ComputationChild from './ComputationChild';
import Model, { shared } from './Model';
import { maybeBind, noVirtual, ModelDependency, ModelGetOpts } from './ModelBase';

export default class Computation extends Model implements ModelDependency {
  public signature: ComputationSignature;
  public dependencies: Model[];
  public pattern: RegExp;

  private dirty: boolean;

  constructor(parent: Model, signature: ComputationSignature, key: string) {
    super(parent, key);

    this.signature = signature;

    this.isReadonly = !this.signature.setter;
    this.isComputed = true;

    this.dependencies = [];

    this.dirty = true;

    // TODO: is there a less hackish way to do this?
    this.shuffle = undefined;
  }

  get setRoot() {
    if (this.signature.setter) return this;
    return undefined;
  }

  get(shouldCapture?: boolean, opts?: ModelGetOpts) {
    if (shouldCapture) capture(this);

    if (this.dirty) {
      const old = this.value;
      this.value = this.getValue();
      // this may cause a view somewhere to update, so it must be in a runloop
      if (!runloop.active()) {
        runloop.start();
        if (!isEqual(old, this.value)) this.notifyUpstream();
        runloop.end();
      } else {
        if (!isEqual(old, this.value)) this.notifyUpstream();
      }
      if (this.wrapper) this.newWrapperValue = this.value;
      this.adapt();
      this.dirty = false;
    }

    // if capturing, this value needs to be unwrapped because it's for external use
    return maybeBind(
      this,
      // if unwrap is supplied, it overrides capture
      this.wrapper && (opts && 'unwrap' in opts ? opts.unwrap !== false : shouldCapture)
        ? this.wrapperValue
        : this.value,
      !opts || opts.shouldBind !== false
    );
  }

  getContext(): Ractive | Static {
    return this.parent.isRoot ? this.root.ractive : this.parent.get(false, noVirtual);
  }

  getValue() {
    startCapturing();
    let result;

    try {
      result = this.signature.getter.call(this.root.ractive, this.getContext(), this.getKeypath());
    } catch (err) {
      warnIfDebug(`Failed to compute ${this.getKeypath()}: ${err.message || err}`);

      /* eslint-disable no-console */
      // TODO this is all well and good in Chrome, but...
      // ...also, should encapsulate this stuff better, and only
      // show it if Ractive.DEBUG
      if (hasConsole) {
        if (console.groupCollapsed)
          console.groupCollapsed(
            '%cshow details',
            'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;'
          );
        const sig = this.signature;
        console.error(
          `${err.name}: ${err.message}\n\n${sig.getterString}${
            sig.getterUseStack ? '\n\n' + err.stack : ''
          }`
        );
        if (console.groupCollapsed) console.groupEnd();
      }
      /* eslint-enable no-console */
    }

    const dependencies = stopCapturing();
    if (this.parent.keypath && !~dependencies.indexOf(this.parent)) dependencies.push(this.parent);
    this.setDependencies(dependencies);

    return result;
  }

  mark(): void {
    this.handleChange();
  }

  rebind(next, previous): void {
    // computations will grab all of their deps again automagically
    if (next !== previous) this.handleChange();
  }

  set(value): void {
    if (this.isReadonly) {
      throw new Error(`Cannot set read-only computed value '${this.key}'`);
    }

    this.signature.setter(value, this.getContext(), this.getKeypath());
    this.mark();
  }

  setDependencies(dependencies: Model[]): void {
    // unregister any soft dependencies we no longer have
    let i = this.dependencies.length;
    while (i--) {
      const model = this.dependencies[i];
      if (!~dependencies.indexOf(model)) model.unregister(this);
    }

    // and add any new ones
    i = dependencies.length;
    while (i--) {
      const model = dependencies[i];
      if (!~this.dependencies.indexOf(model)) model.register(this);
    }

    this.dependencies = dependencies;
  }

  handleChange(): void {}

  teardown(): void {
    let i = this.dependencies.length;
    while (i--) {
      if (this.dependencies[i]) this.dependencies[i].unregister(this);
    }
    if (this.parent.computed[this.key] === this) delete this.parent.computed[this.key];
    super.teardown();
  }
}

const prototype = Computation.prototype;
const child = ComputationChild.prototype;
prototype.handleChange = child.handleChange;

// function signature do not match return types so use any
prototype.joinKey = child.joinKey as any;

shared.Computation = Computation;
