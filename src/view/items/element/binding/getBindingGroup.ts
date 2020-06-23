import Model from 'model/Model';
import { removeFromArray } from 'utils/array';

import Binding from './Binding';

export default function getBindingGroup<Value, BindingType extends Binding>(
  group: string,
  model: Model,
  getValue: Function
): BindingGroup<Value, BindingType> {
  const hash = `${group}-bindingGroup`;
  return model[hash] || (model[hash] = new BindingGroup<Value, BindingType>(hash, model, getValue));
}

/**
 * Value is the value processed in the Item
 *
 * BindingType is the Binding where the group is attached
 */
export class BindingGroup<Value, BindingType extends Binding> {
  private hash: string;

  public model: Model;
  public bindings: BindingType[];
  public bound: boolean;

  public getValue: Function;
  public value: Value;
  public lastValue: Value;
  public noInitialValue: boolean;

  constructor(hash: string, model: Model, getValue: Function) {
    this.model = model;
    this.hash = hash;
    this.getValue = (): Value => {
      this.value = getValue.call(this);
      return this.value;
    };

    this.bindings = [];

    // avoid ts errors
    this.noInitialValue = undefined;
  }

  add(binding: BindingType): void {
    this.bindings.push(binding);
  }

  bind(): void {
    this.value = this.model.get();
    this.bindings.forEach(b => b.lastVal(true, this.value));
    this.model.registerTwowayBinding(this);
    this.bound = true;
  }

  remove(binding: BindingType): void {
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
