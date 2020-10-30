import { handleChange, mark, marked } from 'shared/methodCallers';
import { capture } from 'src/global/capture';
import { isUndefined } from 'utils/is';
import { hasOwn } from 'utils/object';
import type ExpressionProxy from 'view/resolvers/ExpressionProxy';

import type Computation from './Computation';
import Model from './Model';
import type { ModelGetOpts } from './ModelBase';

export default class ComputationChild extends Model {
  /**
   * - ExpressionProxy
   * - Computation
   * - ComputationChild
   */
  public parent: Model;

  private dirty: boolean;

  constructor(parent: ComputationChild['parent'], key: ComputationChild['key']) {
    super(parent, key);

    this.isReadonly = !this.root.ractive.syncComputedChildren;
    this.dirty = true;
    this.isComputed = true;
  }

  get setRoot(): Computation {
    return (<Computation>this.parent).setRoot;
  }

  applyValue(value: unknown): void {
    super.applyValue(value);

    if (!this.isReadonly) {
      let source = <ExpressionProxy>this.parent;

      // computed models don't have a shuffle method
      while (source?.shuffle) {
        source = <ExpressionProxy>source.parent;
      }

      if (source) {
        source.dependencies.forEach(mark);
      }
    }

    if (this.setRoot) {
      this.setRoot.set(this.setRoot.value);
    }
  }

  get(shouldCapture?: boolean, opts?: ModelGetOpts): unknown {
    if (shouldCapture) capture(this);

    if (this.dirty) {
      this.dirty = false;
      const parentValue = this.parent.get();
      this.value = parentValue ? parentValue[this.key] : undefined;
      if (this.wrapper) this.newWrapperValue = this.value;
      this.adapt();
    }

    return (opts && 'unwrap' in opts ? opts.unwrap !== false : shouldCapture) && this.wrapper
      ? this.wrapperValue
      : this.value;
  }

  handleChange(): void {
    if (this.dirty) return;
    this.dirty = true;

    if (this.boundValue) this.boundValue = null;

    this.links.forEach(marked);
    this.deps.forEach(handleChange);
    this.children.forEach(handleChange);
  }

  joinKey(key: string): this {
    if (isUndefined(key) || key === '') return this;

    if (!hasOwn(this.childByKey, key)) {
      const child = new ComputationChild(this, key);
      this.children.push(child);
      this.childByKey[key] = child;
    }

    return this.childByKey[key];
  }
}
