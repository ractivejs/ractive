import ModelBase from 'model/ModelBase';
import { rebindMatch } from 'shared/rebind';
import runloop from 'src/global/runloop';
import { Ractive } from 'src/Ractive/RactiveDefinition';
import { Keypath } from 'types/Generic';
import { ObserverCallback, ObserverOpts } from 'types/Observer';
import { removeFromArray } from 'utils/array';
import { isEqual, isFunction } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { create } from 'utils/object';

export default class Observer {
  public keypath: Keypath;
  private context: unknown;
  private callback: ObserverCallback;
  public newValue: unknown;
  public oldContext: unknown;
  public oldValue: unknown;
  public oldFn: ObserverCallback;
  private ractive: Ractive;
  private options: ObserverOpts;

  /** {@link Model} | {@link LinkModel} */
  public model: ModelBase;
  // TSRChange - it's never set so we are removing it
  // private resolver: any;

  private dirty: boolean;
  private cancelled: boolean;

  constructor(
    ractive: Observer['ractive'],
    model: Observer['model'],
    callback: Observer['callback'],
    options: Observer['options']
  ) {
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

  cancel(): void {
    this.cancelled = true;
    this.model.unregister(this);
    // TSRChange - see comment in resolver prop
    // if (this.model) {
    //   this.model.unregister(this);
    // } else {
    //   this.resolver.unbind();
    // }
    removeFromArray(this.ractive._observers, this);
  }

  dispatch(): void {
    if (!this.cancelled) {
      try {
        this.callback.call(this.context, this.newValue, this.oldValue, this.keypath);
      } catch (err) {
        warnIfDebug(
          `Failed to execute observer callback for '${this.keypath}': ${err.message || err}`
        );
      }
      updateOld(this, true);
      this.dirty = false;
    }
  }

  handleChange(): void {
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

  rebind(next: this['model'], previous: this['model']): boolean {
    next = rebindMatch(this.keypath, next, previous);
    if (next === this.model) return false;

    if (this.model) this.model.unregister(this);
    if (next) next.addShuffleTask(() => this.resolved(next));
  }

  resolved(model: this['model']): void {
    this.model = model;

    this.oldValue = undefined;
    this.newValue = model.get();

    model.register(this);
  }
}

function updateOld(observer: Observer, fresh?: boolean): void {
  const next = fresh
    ? observer.model
      ? observer.model.get()
      : observer.newValue
    : observer.newValue;
  try {
    observer.oldValue = observer.oldFn
      ? observer.oldFn.call(observer.oldContext, undefined, next, observer.keypath)
      : next;
  } catch (err) {
    warnIfDebug(
      `Failed to execute observer oldValue callback for '${this.keypath}': ${err.message || err}`
    );
    observer.oldValue = next;
  }
}
