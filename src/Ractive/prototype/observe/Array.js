import { removeFromArray } from 'utils/array';
import { isArray } from 'utils/is';
import runloop from 'src/global/runloop';
import { warnIfDebug } from 'utils/log';

function negativeOne() {
  return -1;
}

export default class ArrayObserver {
  constructor(ractive, model, callback, options) {
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

  cancel() {
    this.model.unregister(this);
    removeFromArray(this.ractive._observers, this);
  }

  dispatch() {
    try {
      this.callback(this.pending);
    } catch (err) {
      warnIfDebug(
        `Failed to execute array observer callback for '${this.keypath}': ${err.message || err}`
      );
    }
    this.pending = null;
    if (this.options.once) this.cancel();
  }

  handleChange(path) {
    if (this.pending) {
      // post-shuffle
      runloop.addObserver(this, this.options.defer);
    } else if (!path) {
      // entire array changed
      this.shuffle(this.sliced.map(negativeOne));
      this.handleChange();
    }
  }

  shuffle(newIndices) {
    const newValue = this.slice();

    const inserted = [];
    const deleted = [];
    let start;

    const hadIndex = {};

    newIndices.forEach((newIndex, oldIndex) => {
      hadIndex[newIndex] = true;

      if (newIndex !== oldIndex && start === undefined) {
        start = oldIndex;
      }

      if (newIndex === -1) {
        deleted.push(this.sliced[oldIndex]);
      }
    });

    if (start === undefined) start = newIndices.length;

    const len = newValue.length;
    for (let i = 0; i < len; i += 1) {
      if (!hadIndex[i]) inserted.push(newValue[i]);
    }

    this.pending = { inserted, deleted, start };
    this.sliced = newValue;
  }

  slice() {
    const value = this.model.get();
    return isArray(value) ? value.slice() : [];
  }
}
