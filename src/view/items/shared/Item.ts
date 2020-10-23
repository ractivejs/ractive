import type TemplateItemType from 'config/types';
import type ModelBase from 'model/ModelBase';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { FindOpts } from 'types/MethodOptions';
import { createDocumentFragment } from 'utils/dom';
import { isObject } from 'utils/is';
import type Fragment from 'view/Fragment';

export interface ItemOpts {
  up: Item['up'];
  template: Item['template'];
  index?: Item['index'];
}

export default abstract class Item {
  public up: Fragment;
  public ractive: Ractive;

  // TODO maybe add it as generic type?
  public template: any;
  public type: TemplateItemType;
  public index: number;

  public dirty = false;

  public fragment: Fragment;

  public model: ModelBase;

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
  find(_selector: string, _options: FindOpts): Element {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(_selector: string, _options: FindOpts): void {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findComponent(_name: string, _options: FindOpts): Ractive {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllComponents(_name: string, _options: FindOpts): void {}

  findNextNode() {
    return this.up.findNextNode(this);
  }

  rebound(update: boolean): void {
    if (this.fragment) this.fragment.rebound(update);
  }

  shuffled(): void {
    if (this.fragment) this.fragment.shuffled();
  }

  valueOf(): unknown {
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

  find(selector?: string): Element {
    if (this.fragment) {
      return this.fragment.find(selector);
    }
  }

  findAll(selector?: string, options?: FindOpts): void {
    if (this.fragment) {
      this.fragment.findAll(selector, options);
    }
  }

  findComponent(name?: string): ReturnType<Fragment['findComponent']> {
    if (this.fragment) {
      return this.fragment.findComponent(name);
    }
  }

  findAllComponents(name?: string, options?: FindOpts): ReturnType<Fragment['findAllComponents']> {
    if (this.fragment) {
      this.fragment.findAllComponents(name, options);
    }
  }

  firstNode(skipParent: boolean) {
    return this.fragment && this.fragment.firstNode(skipParent);
  }

  toString(escape?: boolean): ReturnType<Fragment['toString']> {
    return this.fragment ? this.fragment.toString(escape) : '';
  }
}

/**
 * basic function that needs to be implemented when extending an Item.
 * Might worth to give a more semantic name
 */
export interface ItemBasicFunctions {
  bind: () => void;
  render: (target: Element | DocumentFragment, occupants: Element[] | ChildNode[]) => void;
  update: () => void;
  unbind: (view: boolean) => void;
  unrender: (shouldDestroy?: boolean) => void;
  detach?: () => DocumentFragment | HTMLElement | globalThis.Text;
  firstNode?: (skip?: boolean) => any;
}

export interface ItemBasicInterface extends Item, ItemBasicFunctions {}

/**
 * From a given item check if it match the given TemplateItemType
 */
export function isItemType<T extends Item>(item: unknown, type: TemplateItemType): item is T {
  return isObject(item) && item.type === type;
}
