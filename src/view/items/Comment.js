import Item from './shared/Item';
import noop from 'utils/noop';
import { detachNode } from 'utils/dom';
import { doc } from 'config/environment';
import { assign, create } from 'utils/object';

export default function Comment(options) {
  Item.call(this, options);
}

const proto = create(Item.prototype);

assign(proto, {
  bind: noop,
  unbind: noop,
  update: noop,

  detach() {
    return detachNode(this.node);
  },

  firstNode() {
    return this.node;
  },

  render(target) {
    this.rendered = true;

    this.node = doc.createComment(this.template.c);
    target.appendChild(this.node);
  },

  toString() {
    return `<!-- ${this.template.c} -->`;
  },

  unrender(shouldDestroy) {
    if (this.rendered && shouldDestroy) this.detach();
    this.rendered = false;
  }
});

Comment.prototype = proto;
