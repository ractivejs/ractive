import { rebindMatch } from 'shared/rebind';
import { assign } from 'utils/object';

import resolve from '../../resolvers/resolve';

import Item, { ContainerItem } from './Item';

export default class Mustache extends Item {
  constructor(options) {
    super(options);

    if (options.owner) this.parent = options.owner;

    this.isStatic = !!options.template.s;

    this.model = null;
    this.dirty = false;
  }

  bind(pre) {
    // yield mustaches and inner contexts should resolve in container context
    const start = this.template.y
      ? this.template.y.containerFragment
      : this.containerFragment || this.up;
    // try to find a model for this view
    const model = pre || resolve(start, this.template);

    if (model) {
      const value = model.get();

      if (this.isStatic) {
        this.model = { get: () => value };
        model.unreference();
        return;
      }

      model.register(this);
      this.model = model;
    }
  }

  handleChange() {
    this.bubble();
  }

  rebind(next, previous, safe) {
    if (this.isStatic) return;

    next = rebindMatch(this.template, next, previous, this.up);
    if (next === this.model) return false;

    if (this.model) {
      this.model.unregister(this);
    }
    if (next) next.addShuffleRegister(this, 'mark');
    this.model = next;
    if (!safe) this.handleChange();
    return true;
  }

  rebound(update) {
    if (this.model) {
      if (this.model.rebound) this.model.rebound(update);
      else {
        // check to see if the model actually changed...
        // yield mustaches and inner contexts should resolve in container context
        const start = this.template.y
          ? this.template.y.containerFragment
          : this.containerFragment || this.up;
        // try to find a model for this view
        const model = resolve(start, this.template);
        if (model !== this.model) {
          this.model.unregister(this);
          this.bind(model);
        }
      }

      if (update) this.bubble();
    }
    if (this.fragment) this.fragment.rebound(update);
  }

  unbind() {
    if (!this.isStatic) {
      this.model && this.model.unregister(this);
      this.model = undefined;
    }
  }
}

export function MustacheContainer(options) {
  Mustache.call(this, options);
}

const proto = (MustacheContainer.prototype = Object.create(ContainerItem.prototype));

assign(proto, Mustache.prototype, { constructor: MustacheContainer });
