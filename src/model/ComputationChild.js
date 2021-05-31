import { capture } from 'src/global/capture';
import Model from './Model';
import { handleChange, mark, marked } from 'shared/methodCallers';
import { hasOwn } from 'utils/object';
import { isUndefined } from 'utils/is';

export default class ComputationChild extends Model {
  constructor(parent, key) {
    super(parent, key);

    this.isReadonly = !this.root.ractive.syncComputedChildren;
    this.dirty = true;
    this.isComputed = true;
  }

  get setRoot() {
    return this.parent.setRoot;
  }

  applyValue(value) {
    super.applyValue(value);

    if (!this.isReadonly) {
      let source = this.parent;
      // computed models don't have a shuffle method
      while (source && source.shuffle) {
        source = source.parent;
      }

      if (source) {
        source.dependencies.forEach(mark);
      }
    }

    if (this.setRoot) {
      this.setRoot.set(this.setRoot.value);
    }
  }

  get(shouldCapture, opts) {
    if (shouldCapture) capture(this);

    if (this.dirty) {
      const parentValue = this.parent.get();
      this.value = parentValue ? parentValue[this.key] : undefined;
      if (this.wrapper) this.newWrapperValue = this.value;
      this.adapt();
    }

    this.dirty = false;

    return (opts && 'unwrap' in opts ? opts.unwrap !== false : shouldCapture) && this.wrapper
      ? this.wrapperValue
      : this.value;
  }

  handleChange() {
    if (this.dirty) {
      this.deps.forEach(handleChange);
      return;
    }

    this.dirty = true;

    if (this.boundValue) this.boundValue = null;

    this.links.forEach(marked);
    this.deps.forEach(handleChange);
    this.children.forEach(handleChange);
  }

  joinKey(key) {
    if (isUndefined(key) || key === '') return this;

    if (!hasOwn(this.childByKey, key)) {
      const child = new ComputationChild(this, key);
      this.children.push(child);
      this.childByKey[key] = child;
    }

    return this.childByKey[key];
  }
}
