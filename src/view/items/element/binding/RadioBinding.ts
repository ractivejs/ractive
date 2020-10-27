import runloop from 'src/global/runloop';
import type { RactiveHTMLInputElement } from 'types/RactiveHTMLElement';
import { removeFromArray } from 'utils/array';

import type Input from '../specials/Input';

import Binding, { BasicBindingInterface } from './Binding';
import handleDomEvent from './handleDomEvent';

const siblings: { [key: string]: RadioBinding[] } = {};

function getSiblings(hash: string): RadioBinding[] {
  return siblings[hash] || (siblings[hash] = []);
}

export default class RadioBinding extends Binding implements BasicBindingInterface {
  private siblings: RadioBinding[];
  /** @override */
  public node: RactiveHTMLInputElement;

  constructor(element: Input) {
    super(element, 'checked');

    this.siblings = getSiblings(this.ractive._guid + this.element.getAttribute('name'));
    this.siblings.push(this);
  }

  getValue(): boolean {
    return this.node.checked;
  }

  handleChange(): void {
    runloop.start();

    this.siblings.forEach(binding => {
      binding.model.set(binding.getValue());
    });

    runloop.end();
  }

  render(): void {
    super.render();

    this.element.on('change', handleDomEvent);

    // TSRChange - change condition using in
    if ('attachEvent' in this.node) {
      this.element.on('click', handleDomEvent);
    }
  }

  setFromNode(node: HTMLInputElement): void {
    this.model.set(node.checked);
  }

  unbind(): void {
    removeFromArray(this.siblings, this);
  }

  unrender(): void {
    this.element.off('change', handleDomEvent);

    // TSRChange - change condition using in
    if ('attachEvent' in this.node) {
      this.element.off('click', handleDomEvent);
    }
  }
}
