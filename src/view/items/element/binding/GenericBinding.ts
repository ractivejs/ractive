import { isNumeric } from 'utils/is';

import Binding, { BindingValue, BindingWithInitialValue, BasicBindingInterface } from './Binding';
import handleDomEvent from './handleDomEvent';

function handleBlur(): void {
  handleDomEvent.call(this);

  const value = this._ractive.binding.model.get();
  this.value = value == undefined ? '' : value;
}

function handleDelay(delay: number): () => void {
  let timeout;

  return function (): void {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      const binding = this._ractive.binding;
      if (binding.rendered) handleDomEvent.call(this);
      timeout = null;
    }, delay);
  };
}

export default class GenericBinding
  extends Binding
  implements BindingWithInitialValue, BasicBindingInterface {
  public handler: () => void;

  getInitialValue(): BindingValue {
    return '';
  }

  getValue(): BindingValue {
    return this.node.value;
  }

  render(): void {
    super.render();

    // any lazy setting for this element overrides the root
    // if the value is a number, it's a timeout
    let lazy = this.ractive.lazy;
    let timeout = 0;
    const el = this.element;

    if ('lazy' in this.element) {
      lazy = this.element.lazy;
    }

    if (isNumeric(lazy)) {
      timeout = +lazy;
      lazy = false;
    }

    this.handler = timeout ? handleDelay(timeout) : handleDomEvent;

    const node = this.node;

    el.on('change', handleDomEvent);

    if (node.type !== 'file') {
      if (!lazy) {
        el.on('input', this.handler);

        // TSRChange - change condition using in
        // IE is a special snowflake
        if ('attachEvent' in node) {
          el.on('keyup', this.handler);
        }
      }

      el.on('blur', handleBlur);
    }
  }

  unrender(): void {
    const el = this.element;
    this.rendered = false;

    el.off('change', handleDomEvent);
    el.off('input', this.handler);
    el.off('keyup', this.handler);
    el.off('blur', handleBlur);
  }
}
