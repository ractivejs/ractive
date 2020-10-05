import runloop from 'src/global/runloop';

import Element, { ElementOpts } from '../../Element';
import type Binding from '../binding/Binding';

export default class Form extends Element {
  public formBindings: Binding[];

  constructor(options: ElementOpts) {
    super(options);
    this.formBindings = [];
  }

  render(target, occupants): void {
    super.render(target, occupants);
    this.on('reset', handleReset);
  }

  unrender(shouldDestroy: boolean): void {
    this.off('reset', handleReset);
    super.unrender(shouldDestroy);
  }
}

function handleReset(): void {
  const element = this._ractive.proxy;

  runloop.start();
  element.formBindings.forEach(updateModel);
  runloop.end();
}

function updateModel(binding): void {
  binding.model.set(binding.resetValue);
}
