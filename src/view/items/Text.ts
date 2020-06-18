import TemplateItemType from 'config/types';
import { TextTemplateItem } from 'parse/converters/templateItemDefinitions';
import { detachNode } from 'utils/dom';
import { escapeHtml } from 'utils/html';

import { inAttributes } from './element/ConditionalAttribute';
import Item, { ItemOptions } from './shared/Item';
import progressiveText from './shared/progressiveText';

export default class Text extends Item {
  public node: globalThis.Text;
  public rendered: boolean;
  public template: TextTemplateItem;

  constructor(options: ItemOptions) {
    super(options);

    this.type = TemplateItemType.TEXT;
  }

  detach(): globalThis.Text {
    return detachNode(this.node);
  }

  firstNode(): globalThis.Text {
    return this.node;
  }

  // todo add types
  render(target: HTMLElement, occupants): void {
    if (inAttributes()) return;
    this.rendered = true;

    progressiveText(this, target, occupants, this.template);
  }

  toString(escape: boolean): string {
    return escape ? escapeHtml(this.template) : this.template;
  }

  unrender(shouldDestroy: boolean): void {
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
