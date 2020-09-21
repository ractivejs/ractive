import { doc } from 'config/environment';
import type { CommentTemplateItem } from 'parse/converters/templateItemDefinitions';
import { detachNode } from 'utils/dom';

import Item, { ItemOpts } from './shared/Item';

export default class Comment extends Item {
  public rendered: boolean;
  public node: globalThis.Comment;
  public template: CommentTemplateItem;

  constructor(options: ItemOpts) {
    super(options);
  }

  bind(): void {}
  unbind(): void {}
  update(): void {}

  detach(): globalThis.Comment {
    return detachNode(this.node);
  }

  firstNode(): globalThis.Comment {
    return this.node;
  }

  render(target: HTMLElement): void {
    this.rendered = true;

    this.node = doc.createComment(this.template.c);
    target.appendChild(this.node);
  }

  toString(): string {
    return `<!-- ${this.template.c} -->`;
  }

  unrender(shouldDestroy: boolean): void {
    if (this.rendered && shouldDestroy) this.detach();
    this.rendered = false;
  }
}
