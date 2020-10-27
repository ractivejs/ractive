import type Model from 'model/Model';
import type { RactiveHTMLInputElement } from 'types/RactiveHTMLElement';

import type Input from '../specials/Input';

import Binding, { BindingValue, BindingWithInitialValue, BasicBindingInterface } from './Binding';
import getBindingGroup, { BindingGroup } from './getBindingGroup';
import handleDomEvent from './handleDomEvent';

function getValue(): BindingValue {
  const checked = this.bindings.filter((b: RadioNameBinding) => b.node.checked);
  if (checked.length > 0) {
    return checked[0].element.getAttribute('value');
  }
}

export default class RadioNameBinding
  extends Binding
  implements BindingWithInitialValue, BasicBindingInterface {
  private group: BindingGroup<BindingValue, RadioNameBinding>;
  /** @override */
  public node: RactiveHTMLInputElement;

  constructor(element: Input) {
    super(element, 'name');

    this.group = getBindingGroup('radioname', this.model, getValue);
    this.group.add(this);

    if (element.checked) {
      this.group.value = this.getValue();
    }

    this.attribute.interpolator.pathChanged = (): void => this.updateName();
  }

  bind(): void {
    if (!this.group.bound) {
      this.group.bind();
    }
  }

  getInitialValue(): unknown {
    if (this.element.getAttribute('checked')) {
      return this.element.getAttribute('value');
    }
  }

  getValue(): BindingValue {
    return this.element.getAttribute('value');
  }

  handleChange(): void {
    // If this <input> is the one that's checked, then the value of its
    // `name` model gets set to its value
    if (this.node.checked) {
      this.group.value = this.getValue();
      super.handleChange();
    }

    this.updateName();
  }

  lastVal(setting?: boolean, value?: BindingValue): BindingValue {
    if (!this.group) return;
    if (setting) this.group.lastValue = value;
    else return this.group.lastValue;
  }

  rebind(next: Model, previous: Model): void {
    super.rebind(next, previous);
    this.updateName();
  }

  rebound(): void {
    super.rebound();
    this.updateName();
  }

  render(): void {
    super.render();

    const node = this.node;

    this.updateName();
    node.checked = this.element.compare(this.model.get(), this.element.getAttribute('value'));

    this.element.on('change', handleDomEvent);

    // TSRChange - change condition using in
    if ('attachEvent' in node) {
      this.element.on('click', handleDomEvent);
    }
  }

  setFromNode(node: HTMLInputElement): void {
    if (node.checked) {
      this.group.model.set(this.element.getAttribute('value'));
    }
  }

  unbind(): void {
    this.group.remove(this);
  }

  unrender(): void {
    const el = this.element;

    el.off('change', handleDomEvent);

    // TSRChange - change condition using in
    if ('attachEvent' in this.node) {
      el.off('click', handleDomEvent);
    }
  }

  updateName(): void {
    if (this.node) this.node.name = `{{${this.model.getKeypath()}}}`;
  }
}
