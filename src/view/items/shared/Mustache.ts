import type ModelBase from 'model/ModelBase';
import type { ModelWithRebound } from 'model/ModelBase';
import type { ExpressionRefinementTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import { rebindMatch } from 'shared/rebind';
import resolve from 'view/resolvers/resolve';

import Item, { ContainerItem, ItemOpts } from './Item';

export interface MustacheOpts extends ItemOpts {
  owner: any;
}

export default class Mustache extends Item {
  public parent: any;
  private isStatic: boolean;
  public containerFragment: any;

  constructor(options: MustacheOpts) {
    super(options);

    if (options.owner) this.parent = options.owner;

    this.isStatic = !!options.template.s;

    this.model = null;
    this.dirty = false;
  }

  bind(pre?: ModelBase): void {
    // yield mustaches and inner contexts should resolve in container context
    const start = this.template.y
      ? this.template.y.containerFragment
      : this.containerFragment || this.up;
    // try to find a model for this view
    const model = pre || resolve(start, <ExpressionRefinementTemplateItem>this.template);

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
      if ('rebound' in this.model) (<ModelWithRebound>this.model).rebound(update);
      else {
        // check to see if the model actually changed...
        // yield mustaches and inner contexts should resolve in container context
        const start = this.template.y
          ? this.template.y.containerFragment
          : this.containerFragment || this.up;
        // try to find a model for this view
        const model = resolve(start, <ExpressionRefinementTemplateItem>this.template);
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

// TSRChange
// TODO - Maybe this can be done using mixins or something more "elegant"
// export function MustacheContainer(options): void {
//   Mustache.call(this, options);
// }

// const proto = (MustacheContainer.prototype = Object.create(ContainerItem.prototype));

// assign(proto, Mustache.prototype, { constructor: MustacheContainer });

export class MustacheContainer extends Mustache {
  constructor(options: MustacheOpts) {
    super(options);
  }

  // This function is called using super by child classes so we can't declare it as a property
  detach(): DocumentFragment | Element {
    return ContainerItem.prototype.detach.call(this);
  }

  find = ContainerItem.prototype.find;
  findAll = ContainerItem.prototype.findAll;
  findComponent = ContainerItem.prototype.findComponent;
  findAllComponents = ContainerItem.prototype.findAllComponents;
  firstNode = ContainerItem.prototype.firstNode;
  toString = ContainerItem.prototype.toString;
}
