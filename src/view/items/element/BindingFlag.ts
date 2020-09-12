import TemplateItemType from 'config/types';
import { BindingFlagDirectiveTemplateItem } from 'parse/converters/element/elementDefinitions';
import { isArray } from 'utils/is';

import Fragment from '../../Fragment';
import Interpolator from '../Interpolator';
import findElement from '../shared/findElement';
import Item, { isItemType, ItemOpts } from '../shared/Item';

import Input from './specials/Input';
import Select from './specials/Select';

interface BindingFlagOpts extends ItemOpts {
  owner: BindingFlag['owner'];
  /** @override */
  template: BindingFlag['template'];
}

/** Select | Section | Input| Partial */
export interface BindingFlagOwner extends Item {
  attributeByName?: any;
}

export default class BindingFlag extends Item {
  private owner: BindingFlagOwner;
  public element: Input | Select;
  public flag: 'lazy' | 'twoway';
  private bubbler: Select | Input | Fragment;
  public interpolator: Interpolator;
  public value: boolean | number;
  /** @override */
  public template: BindingFlagDirectiveTemplateItem;

  constructor(options: BindingFlagOpts) {
    super(options);

    this.owner = options.owner || options.up.owner || findElement(options.up);
    this.element = this.owner.attributeByName ? this.owner : findElement(options.up);
    this.flag = options.template.v === 'l' ? 'lazy' : 'twoway';
    this.bubbler = this.owner === this.element ? this.element : this.up;

    if (this.element.type === TemplateItemType.ELEMENT) {
      if (isArray(options.template.f)) {
        this.fragment = new Fragment({
          owner: this,
          template: options.template.f
        });
      }

      const firstAndOnlyFragment = this.fragment?.items.length === 1 && this.fragment.items[0];
      this.interpolator =
        isItemType<Interpolator>(firstAndOnlyFragment, TemplateItemType.INTERPOLATOR) &&
        firstAndOnlyFragment;
    }
  }

  bind(): void {
    if (this.fragment) this.fragment.bind();
    set(this, this.getValue(), true);
  }

  bubble(): void {
    if (!this.dirty) {
      this.bubbler.bubble();
      this.dirty = true;
    }
  }

  getValue() {
    if (this.fragment) return this.fragment.valueOf();
    else if ('value' in this) return this.value;
    // TODO find a way to not trigger this compilation error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    else if ('f' in this.template) return this.template.f;
    else return true;
  }

  render(): void {
    set(this, this.getValue(), true);
  }

  toString(): string {
    return '';
  }

  unbind(view): void {
    if (this.fragment) this.fragment.unbind(view);

    delete this.element[this.flag];
  }

  unrender(): void {
    if (this.element.rendered) this.element.recreateTwowayBinding();
  }

  update(): void {
    if (this.dirty) {
      this.dirty = false;
      if (this.fragment) this.fragment.update();
      set(this, this.getValue(), true);
    }
  }
}

function set(flag: BindingFlag, value, update: boolean): boolean | number {
  if (value === 0) {
    flag.value = true;
  } else if (value === 'true') {
    flag.value = true;
  } else if (value === 'false' || value === '0') {
    flag.value = false;
  } else {
    flag.value = value;
  }

  const current = flag.element[flag.flag];

  // TSRChange - split assignment to handle two different types
  if (flag.flag === 'twoway') {
    flag.element[flag.flag] = !!flag.value;
  } else {
    flag.element[flag.flag] = flag.value;
  }

  if (update && !flag.element.attributes.binding && current !== flag.value) {
    flag.element.recreateTwowayBinding();
  }

  return flag.value;
}
