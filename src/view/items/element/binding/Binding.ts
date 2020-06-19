import runloop from 'src/global/runloop';
import { isUndefined } from 'utils/is';
import { warnOnceIfDebug } from 'utils/log';

import Element from '../../Element';
import findElement from '../../shared/findElement';

export type BindingValue = unknown;

export default abstract class Binding {
  public element: Element;
  public ractive: any;
  public attribute: any;
  public model: any;
  public node: any;
  public lastValue: BindingValue;

  public wasUndefined: boolean;
  public rendered: boolean;
  public resetValue;

  constructor(element: Element, name = 'value') {
    this.element = element;
    this.ractive = element.ractive;
    this.attribute = element.attributeByName[name];

    const interpolator = this.attribute.interpolator;
    interpolator.twowayBinding = this;

    const model = interpolator.model;

    if (model.isReadonly && !model.setRoot) {
      const keypath = model.getKeypath().replace(/^@/, '');
      warnOnceIfDebug(
        `Cannot use two-way binding on <${element.name}> element: ${keypath} is read-only. To suppress this warning use <${element.name} twoway='false'...>`,
        { ractive: this.ractive }
      );
      return;
    }

    this.attribute.isTwoway = true;
    this.model = model;

    // initialise value, if it's undefined
    let value = model.get();
    this.wasUndefined = isUndefined(value);

    // Use any casting since not all bindings have getInitialValue function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (isUndefined(value) && typeof (this as any).getInitialValue === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value = (this as any).getInitialValue();
      model.set(value);
    }
    this.lastVal(true, value);

    const parentForm = findElement(this.element, false, 'form');
    if (parentForm) {
      this.resetValue = value;
      parentForm.formBindings.push(this);
    }
  }

  abstract getValue(): BindingValue;

  bind(): void {
    this.model.registerTwowayBinding(this);
  }

  handleChange(): void {
    const value = this.getValue();
    if (this.lastVal() === value) return;

    runloop.start();
    this.attribute.locked = true;
    this.model.set(value);
    this.lastVal(true, value);

    // if the value changes before observers fire, unlock to be updatable cause something weird and potentially freezy is up
    if (this.model.get() !== value) this.attribute.locked = false;
    else runloop.scheduleTask(() => (this.attribute.locked = false));

    runloop.end();
  }

  lastVal(): BindingValue;
  lastVal(setting: boolean, value: unknown): void;
  lastVal(setting?: boolean, value?: BindingValue): void | BindingValue {
    if (setting) this.lastValue = value;
    else return this.lastValue;
  }

  rebind(next, previous): void {
    if (this.model && this.model === previous) previous.unregisterTwowayBinding(this);
    if (next) {
      this.model = next;
      runloop.scheduleTask(() => next.registerTwowayBinding(this));
    }
  }

  rebound(): void {
    if (this.model) this.model.unregisterTwowayBinding(this);
    this.model = this.attribute.interpolator.model;
    this.model && this.model.registerTwowayBinding(this);
  }

  render(): void {
    this.node = this.element.node;
    this.node._ractive.binding = this;
    this.rendered = true; // TODO is this used anywhere?
  }

  setFromNode(node): void {
    this.model.set(node.value);
  }

  unbind(): void {
    this.model && this.model.unregisterTwowayBinding(this);
  }

  abstract unrender(): void;
}

export interface BindingWithInitialValue {
  getInitialValue(): BindingValue;
}

export interface BasicBindingInterface {
  render: () => void;
  unrender: () => void;
}