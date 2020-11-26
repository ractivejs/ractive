import { doc } from 'config/environment';
import Namespace from 'src/config/namespace';
import { toArray } from 'utils/array';
import { createElement } from 'utils/dom';
import noop from 'utils/noop';

import Fragment from '../../Fragment';
import Item, { ItemOpts } from '../shared/Item';

const div: HTMLDivElement = doc ? createElement('div') : null;

let attributes = false;
export function inAttributes(): boolean {
  return attributes;
}

/** Component | Element | Input */
export interface ConditionalAttributeOwner extends Item {
  node?: HTMLElement;
}

interface ConditionalAttributeOpts extends ItemOpts {
  owner: ConditionalAttribute['owner'];
}

export default class ConditionalAttribute extends Item {
  private owner: ConditionalAttributeOwner;
  private attributes: Attr[];
  private node: HTMLElement;
  private isSvg: boolean;
  private rendered: boolean;

  constructor(options: ConditionalAttributeOpts) {
    super(options);

    this.attributes = [];

    this.owner = options.owner;

    this.fragment = new Fragment({
      ractive: this.ractive,
      owner: this,
      template: this.template
    });

    // this fragment can't participate in node-y things
    this.fragment.findNextNode = noop;

    this.dirty = false;
  }

  bind(): void {
    this.fragment.bind();
  }

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;
      this.owner.bubble();
    }
  }

  destroyed(): void {
    this.unrender();
  }

  render(): void {
    this.node = this.owner.node;
    if (this.node) {
      this.isSvg = this.node.namespaceURI === Namespace.svg;
    }

    attributes = true;
    if (!this.rendered) this.fragment.render();

    this.rendered = true;
    this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
    this.update();
    attributes = false;
  }

  toString(): string {
    return this.fragment.toString();
  }

  unbind(view: boolean): void {
    this.fragment.unbind(view);
  }

  unrender(): void {
    this.rendered = false;
    this.fragment.unrender();
  }

  update(): void {
    let str: string;
    let attrs: Attr[];

    if (this.dirty) {
      this.dirty = false;

      const current = attributes;
      attributes = true;
      this.fragment.update();

      if (this.rendered && this.node) {
        str = this.fragment.toString();

        attrs = parseAttributes(str, this.isSvg);

        // any attributes that previously existed but no longer do
        // must be removed
        this.attributes
          .filter(a => notIn(attrs, a))
          .forEach(a => {
            this.node.removeAttribute(a.name);
          });

        attrs.forEach(a => {
          this.node.setAttribute(a.name, a.value);
        });

        this.attributes = attrs;
      }

      attributes = current || false;
    }
  }
}

const onlyWhitespace = /^\s*$/;
function parseAttributes(str: string, isSvg: boolean): Attr[] {
  if (onlyWhitespace.test(str)) return [];
  const tagName = isSvg ? 'svg' : 'div';

  if (str) {
    div.innerHTML = `<${tagName} ${str}></${tagName}>`;
    return toArray((div.childNodes[0] as HTMLElement).attributes);
  }

  return [];
}

function notIn(haystack: Attr[], needle: Attr): boolean {
  let i = haystack.length;

  while (i--) {
    if (haystack[i].name === needle.name) {
      return false;
    }
  }

  return true;
}
