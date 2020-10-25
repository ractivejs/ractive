import GenericBinding from './GenericBinding';

export default class NumericBinding extends GenericBinding {
  /** @override */
  getInitialValue(): undefined {
    return undefined;
  }

  /** @override */
  getValue(): number | undefined {
    const value = parseFloat(this.node.value);
    return isNaN(value) ? undefined : value;
  }

  setFromNode(node: HTMLInputElement): void {
    const value = parseFloat(node.value);
    if (!isNaN(value)) this.model.set(value);
  }
}
