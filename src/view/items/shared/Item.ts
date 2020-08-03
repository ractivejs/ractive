import TemplateItemType from 'config/types';
import { createDocumentFragment } from 'utils/dom';
import Fragment from 'view/Fragment';

export interface ItemOpts {
  up: Item['up'];
  template: Item['template'];
  index: Item['index'];
}

export default class Item {
  // TODO add correct types
  public up: any;
  public ractive: any;

  public template: any;
  public type: TemplateItemType;
  public index: number;

  public dirty = false;

  public fragment: Fragment;

  public model: any;
  public newModel: any;

  constructor(options: ItemOpts) {
    this.up = options.up;
    this.ractive = options.up.ractive;

    this.template = options.template;
    this.type = options.template.t;
    this.index = options.index;
  }

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;
      this.up.bubble();
    }
  }

  destroyed(): void {
    if (this.fragment) this.fragment.destroyed();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  find(_selector, _options) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(_selector, _options): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findComponent(_name, _options) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllComponents(_name, _options) {}

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
  constructor(options: ItemOpts) {
    super(options);
  }

  /**
   * Function signature include also Element to be compatible
   * with other classes which extend this class
   */
  detach(): DocumentFragment | Element {
    return this.fragment ? this.fragment.detach() : createDocumentFragment();
  }

  find(selector?) {
    if (this.fragment) {
      return this.fragment.find(selector);
    }
  }

  // todo use findOptions?
  findAll(selector?, options?): void {
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
export interface ItemBasicFunctions {
  bind: () => void;
  render: (target: HTMLElement, ...args) => void;
  update: () => void;
  unbind: () => void;
  unrender: (shouldDestroy?: boolean) => void;
}

export interface ItemBasicInterface extends Item, ItemBasicFunctions {}
