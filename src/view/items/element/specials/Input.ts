import { isFunction } from 'utils/is';

import Element from '../../Element';
import { BindingFlagOwner } from '../BindingFlag';
import { ConditionalAttributeOwner } from '../ConditionalAttribute';

export default class Input extends Element implements BindingFlagOwner, ConditionalAttributeOwner {
  public checked: boolean;

  render(target, occupants): void {
    super.render(target, occupants);
    this.node.defaultValue = this.node.value;
  }

  compare(value, attrValue): boolean {
    const comparator = this.getAttribute('value-comparator');
    if (comparator) {
      if (isFunction(comparator)) {
        return comparator(value, attrValue);
      }
      if (value && attrValue) {
        return value[comparator] == attrValue[comparator];
      }
    }
    return value == attrValue;
  }
}
