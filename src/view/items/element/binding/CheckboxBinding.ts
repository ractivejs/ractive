import type Input from '../specials/Input';

import Binding, { BindingWithInitialValue, BasicBindingInterface, BindingValue } from './Binding';
import handleDomEvent from './handleDomEvent';

export default class CheckboxBinding
  extends Binding
  implements BindingWithInitialValue, BasicBindingInterface {
  constructor(element: Input) {
    super(element, 'checked');
  }

  render(): void {
    super.render();

    this.element.on('change', handleDomEvent);

    if (this.node.attachEvent) {
      this.element.on('click', handleDomEvent);
    }
  }

  unrender(): void {
    this.element.off('change', handleDomEvent);

    if (this.node.attachEvent) {
      this.element.off('click', handleDomEvent);
    }
  }

  getInitialValue(): BindingValue {
    return !!this.element.getAttribute('checked');
  }

  getValue(): BindingValue {
    return this.node.checked;
  }

  setFromNode(node: HTMLInputElement): void {
    this.model.set(node.checked);
  }
}
