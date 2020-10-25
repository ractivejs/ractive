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

    // TSRChange - change guard using `in`
    if ('attachEvent' in this.node) {
      this.element.on('click', handleDomEvent);
    }
  }

  unrender(): void {
    this.element.off('change', handleDomEvent);

    // TSRChange - change guard using `in`
    if ('attachEvent' in this.node) {
      this.element.off('click', handleDomEvent);
    }
  }

  getInitialValue(): BindingValue {
    return !!this.element.getAttribute('checked');
  }

  getValue(): BindingValue {
    return (<HTMLInputElement>this.node).checked;
  }

  setFromNode(node: HTMLInputElement): void {
    this.model.set(node.checked);
  }
}
