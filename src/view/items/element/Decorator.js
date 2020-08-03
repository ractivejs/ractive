import { missingPlugin } from 'config/errors';
import { findInViewHierarchy } from 'shared/registry';
import runloop from 'src/global/runloop';
import { localFragment } from 'src/shared/Context';
import { warnOnce } from 'utils/log';
import noop from 'utils/noop';

import Fragment from '../../Fragment';
import { setupArgsFn, teardownArgsFn } from '../shared/directiveArgs';
import findElement from '../shared/findElement';

const missingDecorator = {
  update: noop,
  teardown: noop
};

export default class Decorator {
  constructor(options) {
    this.owner = options.owner || options.up.owner || findElement(options.up);
    this.element = this.owner.attributeByName ? this.owner : findElement(options.up);
    this.up = options.up || this.owner.up;
    this.ractive = this.up.ractive || this.owner.ractive;
    const template = (this.template = options.template);

    this.name = template.n;

    this.node = null;
    this.handle = null;

    this.element.decorators.push(this);

    // avoid ts errors
    this.model = undefined;
  }

  bind() {
    // if the owner is the elment, make sure the context includes the element
    const frag = this.element === this.owner ? new Fragment({ owner: this.owner }) : this.up;
    setupArgsFn(this, this.template, frag, { register: true });
  }

  bubble() {
    if (!this.dirty) {
      this.dirty = true;
      // decorators may be owned directly by an element or by a fragment if conditional
      this.owner.bubble();
      this.up.bubble();
    }
  }

  destroyed() {
    if (this.handle) {
      this.handle.teardown();
      this.handle = null;
    }
    this.shouldDestroy = true;
  }

  handleChange() {
    this.bubble();
  }

  rebound(update) {
    if (this.model) this.model.rebound(update);
  }

  render() {
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

      const args = this.model ? this.model.get() : [];
      localFragment.f = this.up;
      this.handle = fn.apply(ractive, [this.node].concat(args));
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

  shuffled() {
    if (this.handle && this.handle.shuffled) this.handle.shuffled();
  }

  toString() {
    return '';
  }

  unbind() {
    teardownArgsFn(this, this.template);
  }

  unrender(shouldDestroy) {
    if ((!shouldDestroy || this.element.rendered) && this.handle) {
      this.handle.teardown();
      this.handle = null;
    }
  }

  update() {
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
}

Decorator.prototype.firstNode = noop;
