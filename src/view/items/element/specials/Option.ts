import { ElementTemplateItem } from 'parse/converters/templateItemDefinitions';
import { removeFromArray } from 'utils/array';
import { isArray, isUndefined } from 'utils/is';

import Element, { ElementOptions } from '../../Element';
import findElement from '../../shared/findElement';

import Select from './Select';

interface ElementTemplateItemRuntime extends ElementTemplateItem {
  a: any; // todo understand what is this
}

export default class Option extends Element {
  private select: Select;
  public template: ElementTemplateItemRuntime;

  constructor(options: ElementOptions) {
    const template: ElementTemplateItemRuntime = options.template;
    if (!template.a) template.a = {};

    // If the value attribute is missing, use the element's content,
    // as long as it isn't disabled
    if (isUndefined(template.a.value) && !('disabled' in template.a)) {
      template.a.value = template.f || '';
    }

    super(options);

    this.select = findElement(this.parent || this.up, false, 'select');

    this.isSelected = (): boolean => {
      const optionValue = this.getAttribute('value');

      if (isUndefined(optionValue) || !this.select) {
        return false;
      }

      const selectValue = this.select.getAttribute('value');

      if (this.select.compare(selectValue, optionValue)) {
        return true;
      }

      if (this.select.getAttribute('multiple') && isArray(selectValue)) {
        let i = selectValue.length;
        while (i--) {
          if (this.select.compare(selectValue[i], optionValue)) {
            return true;
          }
        }
      }
    };
  }

  bind(): void {
    if (!this.select) {
      super.bind();
      return;
    }

    // If the select has a value, it overrides the `selected` attribute on
    // this option - so we delete the attribute
    const selectedAttribute = this.attributeByName.selected;
    if (selectedAttribute && this.select.getAttribute('value') !== undefined) {
      const index = this.attributes.indexOf(selectedAttribute);
      this.attributes.splice(index, 1);
      delete this.attributeByName.selected;
    }

    super.bind();
    this.select.options.push(this);
  }

  bubble(): void {
    // if we're using content as value, may need to update here
    const value = this.getAttribute('value');
    if (this.node && this.node.value !== value) {
      this.node._ractive.value = value;
    }
    super.bubble();
  }

  getAttribute(name: string) {
    const attribute = this.attributeByName[name];
    return attribute
      ? attribute.getValue()
      : name === 'value' && this.fragment
      ? this.fragment.valueOf()
      : undefined;
  }

  render(target, occupants): void {
    super.render(target, occupants);

    if (!this.attributeByName.value) {
      this.node._ractive.value = this.getAttribute('value');
    }
  }

  unbind(view): void {
    super.unbind(view);

    if (this.select) {
      removeFromArray(this.select.options, this);
    }
  }
}
