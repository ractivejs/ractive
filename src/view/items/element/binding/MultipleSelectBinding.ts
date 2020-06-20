import { arrayContentsMatch } from 'utils/array';
import getSelectedOptions from 'utils/getSelectedOptions';
import { isUndefined } from 'utils/is';

import Select from '../specials/Select';

import Binding, { BindingWithInitialValue, BindingValue } from './Binding';
import handleDomEvent from './handleDomEvent';

export default class MultipleSelectBinding extends Binding
  implements BindingWithInitialValue, BindingWithInitialValue {
  /**
   * Add check to avoid compatibility error  on Input element
   * @override
   */
  public element: Select & { checked: boolean };

  getInitialValue(): BindingValue[] {
    return this.element.options
      .filter(option => option.getAttribute('selected'))
      .map(option => option.getAttribute('value'));
  }

  getValue(): BindingValue[] {
    const options = this.element.node.options;
    const len = options.length;

    const selectedValues = [];

    for (let i = 0; i < len; i += 1) {
      const option = options[i];

      if (option.selected) {
        const optionValue = option._ractive ? option._ractive.value : option.value;
        selectedValues.push(optionValue);
      }
    }

    return selectedValues;
  }

  handleChange(): this {
    const attribute = this.attribute;
    const previousValue = attribute.getValue();

    const value = this.getValue();

    if (isUndefined(previousValue) || !arrayContentsMatch(value, previousValue)) {
      super.handleChange();
    }

    return this;
  }

  render(): void {
    super.render();

    this.element.on('change', handleDomEvent);

    if (isUndefined(this.model.get())) {
      // get value from DOM, if possible
      this.handleChange();
    }
  }

  setFromNode(node): void {
    const selectedOptions = getSelectedOptions(node);
    let i = selectedOptions.length;
    const result = new Array(i);

    while (i--) {
      // todo add correct type when we will have an inrerface for augmented HTML elements
      const option: any = selectedOptions[i];
      result[i] = option._ractive ? option._ractive.value : option.value;
    }

    this.model.set(result);
  }

  unrender(): void {
    this.element.off('change', handleDomEvent);
  }
}
