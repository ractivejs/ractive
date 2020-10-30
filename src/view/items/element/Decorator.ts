import { missingPlugin } from 'config/errors';
import type { DecoratorDirectiveTemplateItem } from 'parse/converters/element/elementDefinitions';
import { findInViewHierarchy } from 'shared/registry';
import runloop from 'src/global/runloop';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import { localFragment } from 'src/shared/Context';
import type { DecoratorHandle } from 'types/Decorator';
import { warnOnce } from 'utils/log';
import noop from 'utils/noop';
import type ExpressionProxy from 'view/resolvers/ExpressionProxy';

import Fragment from '../../Fragment';
import type Element from '../Element';
import { teardownArgsFn, setupArgsFnWithRegister } from '../shared/directiveArgs';
import findElement from '../shared/findElement';
import type Item from '../shared/Item';

const missingDecorator: DecoratorHandle = {
  update: noop,
  teardown: noop
};

interface DecoratorOpts {
  owner: Decorator['owner'];
  up: Decorator['up'];
  template: Decorator['template'];
}

/** Partial | Section | Element */
export interface DecoratorOwner extends Item {
  bubble(): void;
}

export default class Decorator {
  private owner: DecoratorOwner;
  private element: Element;
  private up: Fragment;
  private ractive: Ractive;
  private template: DecoratorDirectiveTemplateItem;
  public name: string;
  private node: HTMLElement;
  public handle: DecoratorHandle;
  public model: ExpressionProxy;
  private dirty: boolean;
  private shouldDestroy: boolean;

  constructor(options: DecoratorOpts) {
    this.owner = options.owner || options.up.owner || findElement(options.up);
    this.element = 'attributeByName' in this.owner ? this.owner : findElement(options.up);
    this.up = options.up || this.owner.up;
    this.ractive = this.up.ractive || this.owner.ractive;
    const template = (this.template = options.template);

    this.name = template.n;

    this.node = null;
    this.handle = null;

    this.element.decorators.push(this);
  }

  bind(): void {
    // if the owner is the element, make sure the context includes the element
    const frag = this.element === this.owner ? new Fragment({ owner: this.owner }) : this.up;
    setupArgsFnWithRegister(this, this.template, frag);
  }

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;
      // decorators may be owned directly by an element or by a fragment if conditional
      this.owner.bubble();
      this.up.bubble();
    }
  }

  destroyed(): void {
    if (this.handle) {
      this.handle.teardown();
      this.handle = null;
    }
    this.shouldDestroy = true;
  }

  handleChange(): void {
    this.bubble();
  }

  rebound(update: boolean): void {
    if (this.model) this.model.rebound(update);
  }

  render(): void {
    this.shouldDestroy = false;
    if (this.handle) this.unrender();
    const ractive = this.ractive;
    runloop.scheduleTask(() => {
      // bail if the host element has managed to become unrendered
      if (!this.element.rendered) return;

      const fn = findInViewHierarchy('decorators', ractive, this.name);

      if (!fn) {
        warnOnce(missingPlugin(this.name, 'decorator'));
        this.handle = missingDecorator;
        return;
      }

      this.node = this.element.node;

      const args = this.model ? <unknown[]>this.model.get() : [];
      localFragment.f = this.up;

      this.handle = fn.apply(ractive, [this.node, ...args]);
      localFragment.f = null;

      if (!this.handle || !this.handle.teardown) {
        throw new Error(
          `The '${this.name}' decorator must return an object with a teardown method`
        );
      }

      // watch out for decorators that cause their host element to be unrendered
      if (this.shouldDestroy) this.destroyed();
    }, true);
  }

  shuffled(): void {
    if (this.handle && this.handle.shuffled) this.handle.shuffled();
  }

  toString(): string {
    return '';
  }

  unbind(): void {
    teardownArgsFn(this);
  }

  unrender(shouldDestroy?: boolean): void {
    if ((!shouldDestroy || this.element.rendered) && this.handle) {
      this.handle.teardown();
      this.handle = null;
    }
  }

  update(): void {
    const instance = this.handle;

    if (!this.dirty) {
      if (instance && instance.invalidate) {
        runloop.scheduleTask(() => instance.invalidate(), true);
      }
      return;
    }

    this.dirty = false;

    if (instance) {
      if (!instance.update) {
        this.unrender();
        this.render();
      } else {
        const args = this.model ? this.model.get() : [];
        instance.update.apply(this.ractive, args);
      }
    }
  }

  firstNode = noop;
}
