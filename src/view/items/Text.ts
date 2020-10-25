import TemplateItemType from 'config/types';
import type { TextTemplateItem } from 'parse/converters/templateItemDefinitions';
import { detachNode } from 'utils/dom';
import { escapeHtml } from 'utils/html';

import { inAttributes } from './element/ConditionalAttribute';
import Item, { ItemOpts, ItemBasicInterface } from './shared/Item';
import progressiveText, { TextOccupant } from './shared/progressiveText';

export default class Text extends Item implements ItemBasicInterface {
  public node: globalThis.Text;
  public rendered: boolean;
  public template: TextTemplateItem;

  constructor(options: ItemOpts) {
    super(options);

    this.type = TemplateItemType.TEXT;
  }

  detach(): Text['node'] {
    return detachNode(this.node);
  }

  firstNode(): Text['node'] {
    return this.node;
  }

  render(target: HTMLElement, occupants: TextOccupant[]): void {
    if (inAttributes()) return;
    this.rendered = true;

    progressiveText(this, target, occupants, this.template);
  }

  toString(escape?: boolean): string {
    return escape ? escapeHtml(this.template) : this.template;
  }

  unrender(shouldDestroy?: boolean): void {
    if (this.rendered && shouldDestroy) this.detach();
    this.rendered = false;
  }

  valueOf(): string {
    return this.template;
  }

  bind(): void {}
  unbind(): void {}
  update(): void {}
}
