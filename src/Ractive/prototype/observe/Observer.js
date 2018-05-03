import { isEqual, isFunction } from 'utils/is';
import { removeFromArray } from 'utils/array';
import runloop from 'src/global/runloop';
import { rebindMatch } from 'shared/rebind';
import { create } from 'utils/object';

export default class Observer {
  constructor(ractive, model, callback, options) {
    this.context = options.context || ractive;
    this.callback = callback;
    this.ractive = ractive;
    this.keypath = options.keypath;
    this.options = options;

    if (model) this.resolved(model);

    if (isFunction(options.old)) {
      this.oldContext = create(ractive);
      this.oldFn = options.old;
    }

    if (options.init !== false) {
      this.dirty = true;
      this.dispatch();
    } else {
      updateOld(this);
    }

    this.dirty = false;
  }

  cancel() {
    this.cancelled = true;
    if (this.model) {
      this.model.unregister(this);
    } else {
      this.resolver.unbind();
    }
    removeFromArray(this.ractive._observers, this);
  }

  dispatch() {
    if (!this.cancelled) {
      this.callback.call(this.context, this.newValue, this.oldValue, this.keypath);
      updateOld(this, true);
      this.dirty = false;
    }
  }

  handleChange() {
    if (!this.dirty) {
      const newValue = this.model.get();
      if (isEqual(newValue, this.oldValue)) return;

      this.newValue = newValue;

      if (this.options.strict && this.newValue === this.oldValue) return;

      runloop.addObserver(this, this.options.defer);
      this.dirty = true;

      if (this.options.once) runloop.scheduleTask(() => this.cancel());
    } else {
      // make sure the newValue stays updated in case this observer gets touched multiple times in one loop
      this.newValue = this.model.get();
    }
  }

  rebind(next, previous) {
    next = rebindMatch(this.keypath, next, previous);
    if (next === this.model) return false;

    if (this.model) this.model.unregister(this);
    if (next) next.addShuffleTask(() => this.resolved(next));
  }

  resolved(model) {
    this.model = model;

    this.oldValue = undefined;
    this.newValue = model.get();

    model.register(this);
  }
}

function updateOld(observer, fresh) {
  const next = fresh
    ? observer.model
      ? observer.model.get()
      : observer.newValue
    : observer.newValue;
  observer.oldValue = observer.oldFn
    ? observer.oldFn.call(observer.oldContext, undefined, next, observer.keypath)
    : next;
}
