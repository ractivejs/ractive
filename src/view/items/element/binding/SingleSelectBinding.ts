import runloop from 'src/global/runloop';
import getSelectedOptions from 'utils/getSelectedOptions';

import type Select from '../specials/Select';

import Binding, { BindingWithInitialValue, BasicBindingInterface, BindingValue } from './Binding';
import handleDomEvent from './handleDomEvent';

export default class SingleSelectBinding
  extends Binding
  implements BindingWithInitialValue, BasicBindingInterface {
  /**
   * Add check to avoid compatibility error  on Input element
   * @warning same as {@link MultipleSelectBinding}
   *
   * @override
   */
  public element: Select;

  forceUpdate(): void {
    const value = this.getValue();

    if (value !== undefined) {
      this.attribute.locked = true;
      runloop.scheduleTask(() => (this.attribute.locked = false));
      this.model.set(value);
    }
  }

  getInitialValue(): void {
    if (this.element.getAttribute('value') !== undefined) {
      return;
    }

    const options = this.element.options;
    const len = options.length;

    if (!len) return;

    let value;
    let optionWasSelected;
    let i = len;

    // take the final selected option...
    while (i--) {
      const option = options[i];

      if (option.getAttribute('selected')) {
        if (!option.getAttribute('disabled')) {
          value = option.getAttribute('value');
        }

        optionWasSelected = true;
        break;
      }
    }

    // or the first non-disabled option, if none are selected
    if (!optionWasSelected) {
      while (++i < len) {
        if (!options[i].getAttribute('disabled')) {
          value = options[i].getAttribute('value');
          break;
        }
      }
    }

    // This is an optimisation (aka hack) that allows us to forgo some
    // other more expensive work
    // TODO does it still work? seems at odds with new architecture
    if (value !== undefined) {
      this.element.attributeByName.value.value = value;
    }

    return value;
  }

  getValue(): BindingValue {
    const options = this.node.options;
    const len = options.length;

    let i;
    for (i = 0; i < len; i += 1) {
      const option = options[i];

      if (options[i].selected && !options[i].disabled) {
        return option._ractive ? option._ractive.value : option.value;
      }
    }
  }

  render(): void {
    super.render();
    this.element.on('change', handleDomEvent);
  }

  setFromNode(node: HTMLSelectElement): void {
    // todo add correct type when we will have an inrerface for augmented HTML elements
    const option: any = getSelectedOptions(node)[0];
    this.model.set(option._ractive ? option._ractive.value : option.value);
  }

  unrender(): void {
    this.element.off('change', handleDomEvent);
  }
}
