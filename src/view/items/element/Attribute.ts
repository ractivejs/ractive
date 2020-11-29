import TemplateItemType from 'config/types';
import Namespace from 'src/config/namespace';
import type { ValueMap } from 'types/Generic';
import type { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { safeAttributeString } from 'utils/dom';
import { booleanAttributes } from 'utils/html';
import hyphenateCamel from 'utils/hyphenateCamel';
import { isArray, isString, isUndefined } from 'utils/is';

import Fragment from '../../Fragment';
import type Element from '../Element';
import type Interpolator from '../Interpolator';
import findElement from '../shared/findElement';
import Item, { isItemType, ItemOpts } from '../shared/Item';

import getUpdateDelegate, { UpdateDelegate } from './attribute/getUpdateDelegate';
import propertyNames from './attribute/propertyNames';
import { inAttributes } from './ConditionalAttribute';

function lookupNamespace(node, prefix): string {
  const qualified = `xmlns:${prefix}`;

  while (node) {
    if (node.hasAttribute && node.hasAttribute(qualified)) return node.getAttribute(qualified);
    node = node.parentNode;
  }

  return Namespace[prefix];
}

let attribute = false;
export function inAttribute(): boolean {
  return attribute;
}

interface AttributeOptions extends ItemOpts {
  owner: Element;
  element: Element;
}

/** Maybe `any` is better? */
export type AttributeItemValue = string | number | boolean | unknown[] | ValueMap;

export default class Attribute extends Item {
  public name: string;
  public namespace: string;
  public owner: Element;
  public element: Element;
  public node: HTMLElement;
  public template: any; // maybe GenericAttributeTemplateItem

  public updateDelegate: UpdateDelegate;
  public value: AttributeItemValue;
  public interpolator: Interpolator;
  public style: string;
  public inlineClass: string;

  public propertyName: string;
  public useProperty: boolean;

  public rendered: boolean;
  public isTwoway: boolean;
  public locked: boolean;
  public isBoolean: boolean;

  constructor(options: AttributeOptions) {
    super(options);

    this.name = options.template.n;
    this.namespace = null;

    this.owner = options.owner || options.up.owner || options.element || findElement(options.up);
    this.element =
      options.element || (this.owner.attributeByName ? this.owner : findElement(options.up));
    this.up = options.up; // shared
    this.ractive = this.up.ractive;

    this.rendered = false;
    this.updateDelegate = null;
    this.fragment = null;

    this.element.attributeByName[this.name] = this;

    if (!isArray(options.template.f)) {
      this.value = options.template.f;
      if (this.value === 0) {
        this.value = '';
      } else if (isUndefined(this.value)) {
        this.value = true;
      }
      return;
    } else {
      this.fragment = new Fragment({
        owner: this,
        template: options.template.f
      });
    }

    const firstAndOnlyFragment = this.fragment?.items.length === 1 && this.fragment.items[0];
    this.interpolator =
      isItemType<Interpolator>(firstAndOnlyFragment, TemplateItemType.INTERPOLATOR) &&
      firstAndOnlyFragment;

    if (this.interpolator) this.interpolator.owner = this;

    this.isTwoway = undefined;
  }

  bind(): void {
    if (this.fragment) {
      this.fragment.bind();
    }
  }

  bubble(): void {
    if (!this.dirty) {
      this.up.bubble();
      this.element.bubble();
      this.dirty = true;
    }
  }

  firstNode(): HTMLElement {
    return undefined;
  }

  getString(): string {
    attribute = true;
    const value = this.fragment
      ? this.fragment.toString()
      : this.value != null
      ? '' + this.value
      : '';
    attribute = false;
    return value;
  }

  // TODO could getValue ever be called for a static attribute,
  // or can we assume that this.fragment exists?
  getValue() {
    attribute = true;
    const value = this.fragment
      ? this.fragment.valueOf()
      : booleanAttributes[this.name.toLowerCase()]
      ? true
      : this.value;
    attribute = false;
    return value;
  }

  render(): void {
    const node = <RactiveHTMLElement>this.element.node;
    this.node = node;

    // should we use direct property access, or setAttribute?
    if (!node.namespaceURI || node.namespaceURI === Namespace.html) {
      this.propertyName = propertyNames[this.name] || this.name;

      if (node[this.propertyName] !== undefined) {
        this.useProperty = true;
      }

      // is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
      // node.selected = true rather than node.setAttribute( 'selected', '' )
      if (booleanAttributes[this.name.toLowerCase()] || this.isTwoway) {
        this.isBoolean = true;
      }

      if (this.propertyName === 'value') {
        node._ractive.value = this.value;
      }
    }

    if (node.namespaceURI) {
      const index = this.name.indexOf(':');
      if (index !== -1) {
        this.namespace = lookupNamespace(node, this.name.slice(0, index));
      } else {
        this.namespace = node.namespaceURI;
      }
    }

    this.rendered = true;
    this.updateDelegate = getUpdateDelegate(this);
    this.updateDelegate();
  }

  toString(): string {
    if (inAttributes()) return '';
    attribute = true;

    const value = this.getValue();

    // Special case - select and textarea values (should not be stringified)
    if (
      this.name === 'value' &&
      (this.element.getAttribute('contenteditable') !== undefined ||
        this.element.name === 'select' ||
        this.element.name === 'textarea')
    ) {
      return;
    }

    // Special case – bound radio `name` attributes
    if (
      this.name === 'name' &&
      this.element.name === 'input' &&
      this.interpolator &&
      this.element.getAttribute('type') === 'radio'
    ) {
      return `name="{{${this.interpolator.model.getKeypath()}}}"`;
    }

    // Special case - style and class attributes and directives
    if (
      this.owner === this.element &&
      (this.name === 'style' || this.name === 'class' || this.style || this.inlineClass)
    ) {
      return;
    }

    if (
      !this.rendered &&
      this.owner === this.element &&
      (!this.name.indexOf('style-') || !this.name.indexOf('class-'))
    ) {
      if (!this.name.indexOf('style-')) {
        this.style = hyphenateCamel(this.name.substr(6));
      } else {
        this.inlineClass = this.name.substr(6);
      }

      return;
    }

    if (booleanAttributes[this.name.toLowerCase()])
      return value
        ? isString(value)
          ? `${this.name}="${safeAttributeString(value)}"`
          : this.name
        : '';
    if (value == null) return '';

    const str = safeAttributeString(this.getString());
    attribute = false;

    return str ? `${this.name}="${str}"` : this.name;
  }

  unbind(view: boolean): void {
    if (this.fragment) this.fragment.unbind(view);
  }

  unrender(): void {
    this.updateDelegate(true);

    this.rendered = false;
  }

  update(): void {
    if (this.dirty) {
      let binding;
      this.dirty = false;
      if (this.fragment) this.fragment.update();
      if (this.rendered) this.updateDelegate();
      if (this.isTwoway && !this.locked) {
        this.interpolator.twowayBinding.lastVal(true, this.interpolator.model.get());
      } else if (this.name === 'value' && (binding = this.element.binding)) {
        // special case: name bound element with dynamic value
        const attr = binding.attribute;
        if (attr && !attr.dirty && attr.rendered) {
          this.element.binding.attribute.updateDelegate();
        }
      }
    }
  }
}
