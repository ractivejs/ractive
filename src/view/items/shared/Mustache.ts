import ModelBase from 'model/ModelBase';
import { rebindMatch } from 'shared/rebind';
import { assign } from 'utils/object';
import resolve from 'view/resolvers/resolve';

import Item, { ContainerItem, ItemOpts } from './Item';

export interface MustacheOpts extends ItemOpts {
  owner: any;
}

export default class Mustache extends Item {
  public parent: any;
  private isStatic: boolean;
  private containerFragment: any;

  constructor(options: MustacheOpts) {
    super(options);

    if (options.owner) this.parent = options.owner;

    this.isStatic = !!options.template.s;

    this.model = null;
    this.dirty = false;
  }

  bind(pre): void {
    // yield mustaches and inner contexts should resolve in container context
    const start = this.template.y
      ? this.template.y.containerFragment
      : this.containerFragment || this.up;
    // try to find a model for this view
    const model = pre || resolve(start, this.template);

    if (model) {
      const value = model.get();

      if (this.isStatic) {
        this.model = { get: () => value } as ModelBase;
        model.unreference();
        return;
      }

      model.register(this);
      this.model = model;
    }
  }

  handleChange(): void {
    this.bubble();
  }

  rebind(next, previous, safe): boolean {
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

  rebound(update: boolean): void {
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

  unbind(): void {
    if (!this.isStatic) {
      this.model && this.model.unregister(this);
      this.model = undefined;
    }
  }
}

// TODO implement an interface to define MustacheContainer behaviuor
export function MustacheContainer(options): void {
  Mustache.call(this, options);
}

const proto = (MustacheContainer.prototype = Object.create(ContainerItem.prototype));

assign(proto, Mustache.prototype, { constructor: MustacheContainer });
