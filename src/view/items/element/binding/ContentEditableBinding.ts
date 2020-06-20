import Binding, { BindingWithInitialValue, BasicBindingInterface } from './Binding';
import handleDomEvent from './handleDomEvent';

export default class ContentEditableBinding extends Binding
  implements BindingWithInitialValue, BasicBindingInterface {
  getInitialValue(): string {
    return this.element.fragment ? this.element.fragment.toString() : '';
  }

  getValue(): string {
    return this.element.node.innerHTML;
  }

  render(): void {
    super.render();

    const el = this.element;

    el.on('change', handleDomEvent);
    el.on('blur', handleDomEvent);

    if (!this.ractive.lazy) {
      el.on('input', handleDomEvent);

      if (this.node.attachEvent) {
        el.on('keyup', handleDomEvent);
      }
    }
  }

  setFromNode(node: HTMLInputElement): void {
    this.model.set(node.innerHTML);
  }

  unrender(): void {
    const el = this.element;

    el.off('blur', handleDomEvent);
    el.off('change', handleDomEvent);
    el.off('input', handleDomEvent);
    el.off('keyup', handleDomEvent);
  }
}
