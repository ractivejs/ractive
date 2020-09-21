import runloop from 'src/global/runloop';
import { removeFromArray } from 'utils/array';

import type Input from '../specials/Input';

import Binding, { BasicBindingInterface, BindingWithInitialValue } from './Binding';
import handleDomEvent from './handleDomEvent';

const siblings: { [key: string]: RadioBinding[] } = {};

function getSiblings(hash: string): RadioBinding[] {
  return siblings[hash] || (siblings[hash] = []);
}

export default class RadioBinding extends Binding implements BasicBindingInterface {
  private siblings: RadioBinding[];

  constructor(element: Input) {
    super(element, 'checked');

    this.siblings = getSiblings(this.ractive._guid + this.element.getAttribute('name'));
    this.siblings.push(this);
  }

  getValue(): BindingWithInitialValue {
    return this.node.checked;
  }

  handleChange(): void {
    runloop.start();

    this.siblings.forEach(binding => {
      binding.model.set(binding.getValue());
    });

    runloop.end();
  }

  render(): void {
    super.render();

    this.element.on('change', handleDomEvent);

    if (this.node.attachEvent) {
      this.element.on('click', handleDomEvent);
    }
  }

  setFromNode(node): void {
    this.model.set(node.checked);
  }

  unbind(): void {
    removeFromArray(this.siblings, this);
  }

  unrender(): void {
    this.element.off('change', handleDomEvent);

    if (this.node.attachEvent) {
      this.element.off('click', handleDomEvent);
    }
  }
}
