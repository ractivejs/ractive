import TemplateItemType from 'config/types';
import { createDocumentFragment } from 'utils/dom';

export interface ItemOptions {
  up: any; // TODO add correct types
  template: any; // TODO add correct types
  index: number;
}

export default class Item {
  // TODO add correct types
  public up: any;
  public ractive: any;

  public template;
  public type: TemplateItemType;
  public index: number;

  public dirty = false;

  public fragment: any;

  public model: any;
  public newModel: any;

  constructor(options: ItemOptions) {
    this.up = options.up;
    this.ractive = options.up.ractive;

    this.template = options.template;
    this.type = options.template.t;
    this.index = options.index;
  }

  findAll() {}
  findAllComponents() {}

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;
      this.up.bubble();
    }
  }

  destroyed(): void {
    if (this.fragment) this.fragment.destroyed();
  }

  find() {
    return null;
  }

  findComponent() {
    return null;
  }

  findNextNode() {
    return this.up.findNextNode(this);
  }

  rebound(update): void {
    if (this.fragment) this.fragment.rebound(update);
  }

  shuffled(): void {
    if (this.fragment) this.fragment.shuffled();
  }

  valueOf(): string {
    return this.toString();
  }
}

export class ContainerItem extends Item {
  constructor(options: ItemOptions) {
    super(options);
  }

  detach(): DocumentFragment {
    return this.fragment ? this.fragment.detach() : createDocumentFragment();
  }

  find(selector?) {
    if (this.fragment) {
      return this.fragment.find(selector);
    }
  }

  // todo use findOptions?
  findAll(selector?, options?) {
    if (this.fragment) {
      this.fragment.findAll(selector, options);
    }
  }

  findComponent(name?) {
    if (this.fragment) {
      return this.fragment.findComponent(name);
    }
  }

  // todo use findOptions?
  findAllComponents(name?, options?) {
    if (this.fragment) {
      this.fragment.findAllComponents(name, options);
    }
  }

  firstNode(skipParent) {
    return this.fragment && this.fragment.firstNode(skipParent);
  }

  toString(escape?: boolean): string {
    return this.fragment ? this.fragment.toString(escape) : '';
  }
}

/**
 * basic function that needs to be implemented when extenidng an Item.
 * Might worth to give a more semantic name
 */
export interface BaseItemInterface {
  bind: () => void;
  render: (target: HTMLElement, ...args) => void;
  update: () => void;
  unbind: () => void;
  unrender: () => void;
}
