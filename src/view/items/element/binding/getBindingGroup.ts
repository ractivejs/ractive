import Model from 'src/model/Model';
import { removeFromArray } from 'utils/array';

import Binding from './Binding';

export default function getBindingGroup(
  group: string,
  model: Model,
  getValue: Function
): BindingGroup {
  const hash = `${group}-bindingGroup`;
  return model[hash] || (model[hash] = new BindingGroup(hash, model, getValue));
}

export class BindingGroup {
  private hash: string;

  public model: Model;
  public getValue: Function;
  public value: unknown[];
  public noInitialValue: boolean;
  public bindings: any[];
  public bound: boolean;

  constructor(hash: string, model: Model, getValue: Function) {
    this.model = model;
    this.hash = hash;
    this.getValue = (): unknown[] => {
      this.value = getValue.call(this);
      return this.value;
    };

    this.bindings = [];

    // avoid ts errors
    this.noInitialValue = undefined;
  }

  add(binding): void {
    this.bindings.push(binding);
  }

  bind(): void {
    this.value = this.model.get();
    this.bindings.forEach(b => b.lastVal(true, this.value));
    this.model.registerTwowayBinding(this);
    this.bound = true;
  }

  remove(binding): void {
    removeFromArray(this.bindings, binding);
    if (!this.bindings.length) {
      this.unbind();
    }
  }

  unbind(): void {
    this.model.unregisterTwowayBinding(this);
    this.bound = false;
    delete this.model[this.hash];
  }

  rebind = Binding.prototype.rebind;
}
