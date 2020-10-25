import type { BindingWithInitialValue } from './Binding';
import GenericBinding from './GenericBinding';

export default class FileBinding extends GenericBinding implements BindingWithInitialValue {
  getInitialValue(): undefined {
    /* istanbul ignore next */
    return undefined;
  }

  getValue(): FileList {
    /* istanbul ignore next */
    return this.node.files;
  }

  render(): void {
    /* istanbul ignore next */
    this.element.lazy = false;
    /* istanbul ignore next */
    super.render();
  }

  setFromNode(node: HTMLInputElement): void {
    /* istanbul ignore next */
    this.model.set(node.files);
  }
}
