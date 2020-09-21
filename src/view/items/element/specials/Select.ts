import type { RactiveHTMLOptionElement } from 'types/RactiveHTMLElement';
import { toArray } from 'utils/array';
import getSelectedOptions from 'utils/getSelectedOptions';
import { isArray, isFunction } from 'utils/is';

import Element, { ElementOpts } from '../../Element';
import type SingleSelectBinding from '../binding/SingleSelectBinding';
import type { BindingFlagOwner } from '../BindingFlag';

export default class Select extends Element implements BindingFlagOwner {
  public options: any[];
  private selectedOptions: any[];

  /**
   * @override
   */
  public node: HTMLSelectElement;

  constructor(options: ElementOpts) {
    super(options);
    this.options = [];

    this.foundNode = (node: HTMLSelectElement): void => {
      if (this.binding) {
        const selectedOptions = getSelectedOptions(node);

        if (selectedOptions.length > 0) {
          this.selectedOptions = selectedOptions;
        }
      }
    };
  }

  render(target, occupants): void {
    super.render(target, occupants);
    this.sync();

    const node = this.node;

    let i = node.options.length;
    while (i--) {
      node.options[i].defaultSelected = node.options[i].selected;
    }

    this.rendered = true;
  }

  sync(): void {
    const selectNode = this.node;

    if (!selectNode) return;

    const options = toArray(selectNode.options);

    if (this.selectedOptions) {
      options.forEach(o => {
        if (this.selectedOptions.indexOf(o) >= 0) o.selected = true;
        else o.selected = false;
      });
      this.binding.setFromNode(selectNode);
      delete this.selectedOptions;
      return;
    }

    const selectValue = this.getAttribute('value');
    const isMultiple = this.getAttribute('multiple');
    const array = isMultiple && isArray(selectValue);

    // If the <select> has a specified value, that should override
    // these options
    const binding: SingleSelectBinding = (this.binding as unknown) as SingleSelectBinding;
    if (selectValue !== undefined) {
      let optionWasSelected;

      options.forEach((o: RactiveHTMLOptionElement) => {
        const optionValue = o._ractive ? o._ractive.value : o.value;
        const shouldSelect = isMultiple
          ? array && this.valueContains(selectValue, optionValue)
          : this.compare(selectValue, optionValue);

        if (shouldSelect) {
          optionWasSelected = true;
        }

        o.selected = shouldSelect;
      });

      if (!optionWasSelected && !isMultiple) {
        if (binding) {
          binding.forceUpdate();
        }
      }
    } else if (binding?.forceUpdate) {
      // Otherwise the value should be initialised according to which
      // <option> element is selected, if twoway binding is in effect
      binding.forceUpdate();
    }
  }

  valueContains(selectValue: unknown[], optionValue: unknown): boolean {
    let i = selectValue.length;
    while (i--) {
      if (this.compare(optionValue, selectValue[i])) return true;
    }
  }

  compare(optionValue: unknown, selectValue: unknown): boolean {
    const comparator = this.getAttribute('value-comparator');
    if (comparator) {
      if (isFunction(comparator)) {
        return comparator(selectValue, optionValue);
      }
      if (selectValue && optionValue) {
        return selectValue[comparator] == optionValue[comparator];
      }
    }
    return selectValue == optionValue;
  }

  update(): void {
    const dirty = this.dirty;
    super.update();
    if (dirty) {
      this.sync();
    }
  }
}
