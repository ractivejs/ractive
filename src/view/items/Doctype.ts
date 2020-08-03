import { DoctypeTemplateItem } from 'parse/converters/templateItemDefinitions';

import Item, { ItemBasicInterface } from './shared/Item';

export default class Doctype extends Item implements ItemBasicInterface {
  public template: DoctypeTemplateItem;

  toString(): string {
    return '<!DOCTYPE' + this.template.a + '>';
  }

  bind(): void {}
  render(): void {}
  teardown(): void {}
  unbind(): void {}
  unrender(): void {}
  update(): void {}
}
