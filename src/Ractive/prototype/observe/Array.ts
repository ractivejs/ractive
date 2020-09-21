import type ModelBase from 'model/ModelBase';
import type { NewIndexes } from 'shared/getNewIndices';
import runloop from 'src/global/runloop';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { Keypath } from 'types/Generic';
import type { ObserverArrayCallback, ObserverArrayOpts } from 'types/Observer';
import { removeFromArray } from 'utils/array';
import { isArray, isUndefined } from 'utils/is';
import { warnIfDebug } from 'utils/log';

function negativeOne(): number {
  return -1;
}

export default class ArrayObserver {
  private ractive: Ractive;
  private model: ModelBase;
  private keypath: Keypath;
  private callback: ObserverArrayCallback;
  private options: ObserverArrayOpts;
  private pending: { inserted: unknown[]; deleted: unknown[]; start: number };
  private sliced: unknown[];

  constructor(
    ractive: ArrayObserver['ractive'],
    model: ArrayObserver['model'],
    callback: ArrayObserver['callback'],
    options: ArrayObserver['options']
  ) {
    this.ractive = ractive;
    this.model = model;
    this.keypath = model.getKeypath();
    this.callback = callback;
    this.options = options;

    this.pending = null;

    model.register(this);

    if (options.init !== false) {
      this.sliced = [];
      this.shuffle([]);
      this.dispatch();
    } else {
      this.sliced = this.slice();
    }
  }

  cancel(): void {
    this.model.unregister(this);
    removeFromArray(this.ractive._observers, this);
  }

  dispatch(): void {
    try {
      this.callback.call(this.ractive, this.pending);
    } catch (err) {
      warnIfDebug(
        `Failed to execute array observer callback for '${this.keypath}': ${err.message || err}`
      );
    }
    this.pending = null;
    if (this.options.once) this.cancel();
  }

  handleChange(path?: boolean): void {
    if (this.pending) {
      // post-shuffle
      runloop.addObserver(this, this.options.defer);
    } else if (!path) {
      // entire array changed
      this.shuffle(this.sliced.map(negativeOne));
      this.handleChange();
    }
  }

  shuffle(newIndices: NewIndexes): void {
    const newValue = this.slice();

    const inserted = [];
    const deleted = [];
    let start;

    const hadIndex = {};

    newIndices.forEach((newIndex, oldIndex) => {
      hadIndex[newIndex] = true;

      if (newIndex !== oldIndex && isUndefined(start)) {
        start = oldIndex;
      }

      if (newIndex === -1) {
        deleted.push(this.sliced[oldIndex]);
      }
    });

    if (isUndefined(start)) start = newIndices.length;

    const len = newValue.length;
    for (let i = 0; i < len; i += 1) {
      if (!hadIndex[i]) inserted.push(newValue[i]);
    }

    this.pending = { inserted, deleted, start };
    this.sliced = newValue;
  }

  slice(): unknown[] {
    const value = this.model.get();
    return isArray(value) ? value.slice() : [];
  }
}
