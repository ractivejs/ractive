import { win } from 'config/environment';
import TemplateItemType from 'config/types';
import Context from 'shared/Context';
import { destroyed, shuffled } from 'shared/methodCallers';
import Namespace from 'src/config/namespace';
import runloop from 'src/global/runloop';
import { toArray, addToArray, removeFromArray } from 'utils/array';
import { createElement, detachNode, matches, safeAttributeString } from 'utils/dom';
import { escapeHtml, voidElements } from 'utils/html';
import { isString } from 'utils/is';
import { assign, create, defineProperty, keys } from 'utils/object';

import Fragment from '../Fragment';

import createItem from './createItem';
import Attribute from './element/Attribute';
import Binding from './element/binding/Binding';
import selectBinding from './element/binding/selectBinding';
import ConditionalAttribute from './element/ConditionalAttribute';
import Decorator, { DecoratorOwner } from './element/Decorator';
import Input from './element/specials/Input';
import Transition, { TransitionOwner } from './element/Transition';
import EventDirective, { EventDirectiveOwner } from './shared/EventDirective';
import findElement from './shared/findElement';
import { ContainerItem, ItemOpts } from './shared/Item';

const endsWithSemi = /;\s*$/;

export interface ElementOpts extends ItemOpts {
  deferContent: boolean;
}

export default class Element extends ContainerItem
  implements DecoratorOwner, TransitionOwner, EventDirectiveOwner {
  public name: string;
  private namespace: string;
  public parent: Element;
  public node: any;
  public root: any;

  public decorators: Decorator[];
  private statics: Record<string, string>;
  public attributeByName: Record<string, Attribute>;
  public attributes: any[] & { binding?: boolean; unbinding?: boolean };
  public binding: Binding;
  private ctx: Context;
  private listeners: { [key: string]: Function[] & { refs?: number } };
  protected foundNode: Function;
  protected isSelected: Function;
  public intro: Transition;
  public outro: Transition;

  public rendered: boolean;
  public delegate: boolean;
  public lazy: boolean | number;
  public twoway: boolean;

  public events: EventDirective[];

  constructor(options: ElementOpts) {
    super(options);

    this.name = options.template.e.toLowerCase();

    // find parent element
    this.parent = findElement(this.up, false);

    if (this.parent && this.parent.name === 'option') {
      throw new Error(
        `An <option> element cannot contain other elements (encountered <${this.name}>)`
      );
    }

    this.decorators = [];

    // create attributes
    this.attributeByName = {};

    // todo refine types
    let attrs;
    let n, attr, val, cls, name, template, leftovers;

    const m = this.template.m;
    const len = (m && m.length) || 0;

    for (let i = 0; i < len; i++) {
      template = m[i];
      if (template.g) {
        (this.statics || (this.statics = {}))[template.n] = isString(template.f)
          ? template.f
          : template.n;
      } else {
        switch (template.t) {
          case TemplateItemType.ATTRIBUTE:
          case TemplateItemType.BINDING_FLAG:
          case TemplateItemType.DECORATOR:
          case TemplateItemType.EVENT:
          case TemplateItemType.TRANSITION:
            attr = createItem({
              owner: this,
              up: this.up,
              template
            });

            n = template.n;

            attrs = attrs || (attrs = this.attributes = []);

            if (n === 'value') val = attr;
            else if (n === 'name') name = attr;
            else if (n === 'class') cls = attr;
            else attrs.push(attr);

            break;

          case TemplateItemType.DELEGATE_FLAG:
            this.delegate = false;
            break;

          default:
            (leftovers || (leftovers = [])).push(template);
            break;
        }
      }
    }

    if (val) attrs.push(val);
    if (name) attrs.push(name);
    if (cls) attrs.unshift(cls);

    if (leftovers) {
      (attrs || (this.attributes = [])).push(
        new ConditionalAttribute({
          owner: this,
          up: this.up,
          template: leftovers
        })
      );

      // empty leftovers array
      leftovers = [];
    }

    // create children
    if (options.template.f && !options.deferContent) {
      this.fragment = new Fragment({
        template: options.template.f,
        owner: this,
        cssIds: null
      });
    }

    this.binding = null; // filled in later

    // added to avoid typescript errors
    this.root = undefined;
    this.lazy = undefined;
  }

  bind(): void {
    const attrs = this.attributes;
    if (attrs) {
      attrs.binding = true;
      const len = attrs.length;
      for (let i = 0; i < len; i++) attrs[i].bind();
      attrs.binding = false;
    }

    if (this.fragment) this.fragment.bind();

    // create two-way binding if necessary
    if (!this.binding) this.recreateTwowayBinding();
    else this.binding.bind();
  }

  createTwowayBinding() {
    const hasTwoWay = 'twoway' in this;
    if (hasTwoWay ? this.twoway : this.ractive.twoway) {
      const Binding = selectBinding(this);
      if (Binding) {
        const binding = new Binding((this as unknown) as Input);
        if (binding && binding.model) return binding;
      }
    }
  }

  destroyed(): void {
    if (this.attributes) this.attributes.forEach(destroyed);
    if (this.fragment) this.fragment.destroyed();
  }

  detach(): HTMLElement {
    // if this element is no longer rendered, the transitions are complete and the attributes can be torn down
    if (!this.rendered) this.destroyed();

    return detachNode(this.node);
  }

  find(selector?, options?) {
    if (this.node && matches(this.node, selector)) return this.node;
    if (this.fragment) {
      return this.fragment.find(selector, options);
    }
  }

  findAll(selector, options) {
    const { result } = options;

    if (matches(this.node, selector)) {
      result.push(this.node);
    }

    if (this.fragment) {
      this.fragment.findAll(selector, options);
    }
  }

  findNextNode() {
    return null;
  }

  firstNode() {
    return this.node;
  }

  getAttribute(name: string) {
    if (this.statics && name in this.statics) return this.statics[name];
    const attribute = this.attributeByName[name];
    return attribute ? attribute.getValue() : undefined;
  }

  getContext(...assigns: unknown[]): Context {
    if (this.fragment) return this.fragment.getContext(...assigns);

    if (!this.ctx) this.ctx = new Context(this.up, this);
    const target = create(this.ctx);
    return assign(target, ...assigns);
  }

  off(event: string, callback: Function, capture = false): void {
    const delegate = this.up.delegate;
    const ref = this.listeners && this.listeners[event];

    if (!ref) return;
    removeFromArray(ref, callback);

    if (delegate) {
      const listeners =
        (delegate.listeners || (delegate.listeners = [])) &&
        (delegate.listeners[event] || (delegate.listeners[event] = []));
      if (listeners.refs && !--listeners.refs) delegate.off(event, delegateHandler, true);
    } else if (this.rendered) {
      const n = this.node;
      const add = n.addEventListener;
      const rem = n.removeEventListener;

      if (!ref.length) {
        rem.call(n, event, handler, capture);
      } else if (ref.length && !ref.refs && capture) {
        rem.call(n, event, handler, true);
        add.call(n, event, handler, false);
      }
    }
  }

  on(event: string, callback: Function, capture = false): void {
    const delegate = this.up.delegate;
    const ref = (this.listeners || (this.listeners = {}))[event] || (this.listeners[event] = []);

    if (delegate) {
      const listeners =
        ((delegate.listeners || (delegate.listeners = [])) && delegate.listeners[event]) ||
        (delegate.listeners[event] = []);
      if (!listeners.refs) {
        listeners.refs = 0;
        delegate.on(event, delegateHandler, true);
        listeners.refs++;
      } else {
        listeners.refs++;
      }
    } else if (this.rendered) {
      const n = this.node;
      const add = n.addEventListener;
      const rem = n.removeEventListener;

      if (!ref.length) {
        add.call(n, event, handler, capture);
      } else if (ref.length && !ref.refs && capture) {
        rem.call(n, event, handler, false);
        add.call(n, event, handler, true);
      }
    }

    addToArray(this.listeners[event], callback);
  }

  recreateTwowayBinding(): void {
    if (this.binding) {
      this.binding.unbind();
      this.binding.unrender();
    }

    if ((this.binding = this.createTwowayBinding())) {
      this.binding.bind();
      if (this.rendered) this.binding.render();
    }
  }

  rebound(update): void {
    super.rebound(update);
    if (this.attributes) this.attributes.forEach(x => x.rebound(update));
    if (this.binding) this.binding.rebound();
  }

  render(target, occupants): void {
    // TODO determine correct namespace
    this.namespace = getNamespace(this);

    let node;
    let existing = false;

    if (occupants) {
      let n;
      while ((n = occupants.shift())) {
        if (
          n.nodeName.toUpperCase() === this.template.e.toUpperCase() &&
          n.namespaceURI === this.namespace
        ) {
          this.node = node = n;
          existing = true;
          break;
        } else {
          detachNode(n);
        }
      }
    }

    if (!existing && this.node) {
      node = this.node;
      target.appendChild(node);
      existing = true;
    }

    if (!node) {
      const name = this.template.e;
      node = createElement(
        this.namespace === Namespace.html ? name.toLowerCase() : name,
        this.namespace,
        this.getAttribute('is')
      );
      this.node = node;
    }

    // tie the node to this vdom element
    defineProperty(node, '_ractive', {
      value: {
        proxy: this
      },
      configurable: true
    });

    if (this.statics) {
      keys(this.statics).forEach(k => {
        node.setAttribute(k, this.statics[k]);
      });
    }

    if (existing && this.foundNode) this.foundNode(node);

    // register intro before rendering content so children can find the intro
    const intro = this.intro;
    if (intro && intro.shouldFire('intro')) {
      intro.isIntro = true;
      intro.isOutro = false;
      runloop.registerTransition(intro);
    }

    if (this.fragment) {
      const children = existing ? toArray(node.childNodes) : undefined;

      this.fragment.render(node, children);

      // clean up leftover children
      if (children) {
        children.forEach(detachNode);
      }
    }

    if (existing) {
      // store initial values for two-way binding
      if (this.binding && this.binding.wasUndefined) this.binding.setFromNode(node);
      // remove unused attributes
      let i = node.attributes.length;
      while (i--) {
        const name = node.attributes[i].name;
        if (!(name in this.attributeByName) && (!this.statics || !(name in this.statics)))
          node.removeAttribute(name);
      }
    }

    // Is this a top-level node of a component? If so, we may need to add
    // a data-ractive-css attribute, for CSS encapsulation
    if (this.up.cssIds) {
      node.setAttribute('data-ractive-css', this.up.cssIds.map(x => `{${x}}`).join(' '));
    }

    if (this.attributes) {
      const len = this.attributes.length;
      for (let i = 0; i < len; i++) this.attributes[i].render();
    }
    if (this.binding) this.binding.render();

    if (!this.up.delegate && this.listeners) {
      const ls = this.listeners;
      for (const k in ls) {
        if (ls[k] && ls[k].length) this.node.addEventListener(k, handler, !!ls[k].refs);
      }
    }

    if (!existing) {
      target.appendChild(node);
    }

    this.rendered = true;
  }

  shuffled(): void {
    super.shuffled();
    this.decorators.forEach(shuffled);
  }

  toString(): string {
    const tagName = this.template.e;

    let attrs = (this.attributes && this.attributes.map(stringifyAttribute).join('')) || '';

    if (this.statics)
      keys(this.statics).forEach(
        k =>
          k !== 'class' &&
          k !== 'style' &&
          (attrs = ` ${k}="${safeAttributeString(this.statics[k])}"` + attrs)
      );

    // Special case - selected options
    if (this.name === 'option' && this.isSelected()) {
      attrs += ' selected';
    }

    // Special case - two-way radio name bindings
    if (this.name === 'input' && inputIsCheckedRadio(this)) {
      attrs += ' checked';
    }

    // Special case style and class attributes and directives
    let style = this.statics ? this.statics.style : undefined;
    let cls = this.statics ? this.statics.class : undefined;
    this.attributes &&
      this.attributes.forEach(attr => {
        if (attr.name === 'class') {
          cls = (cls || '') + (cls ? ' ' : '') + safeAttributeString(attr.getString());
        } else if (attr.name === 'style') {
          style = (style || '') + (style ? ' ' : '') + safeAttributeString(attr.getString());
          if (style && !endsWithSemi.test(style)) style += ';';
        } else if (attr.style) {
          style =
            (style || '') +
            (style ? ' ' : '') +
            `${attr.style}: ${safeAttributeString(attr.getString())};`;
        } else if (attr.inlineClass && attr.getValue()) {
          cls = (cls || '') + (cls ? ' ' : '') + attr.inlineClass;
        }
      });
    // put classes first, then inline style
    if (style !== undefined) attrs = ' style' + (style ? `="${style}"` : '') + attrs;
    if (cls !== undefined) attrs = ' class' + (cls ? `="${cls}"` : '') + attrs;

    if (this.up.cssIds) {
      attrs += ` data-ractive-css="${this.up.cssIds.map(x => `{${x}}`).join(' ')}"`;
    }

    let str = `<${tagName}${attrs}>`;

    if (voidElements[this.name.toLowerCase()]) return str;

    // Special case - textarea
    if (this.name === 'textarea' && this.getAttribute('value') !== undefined) {
      str += escapeHtml(this.getAttribute('value'));
    } else if (this.getAttribute('contenteditable') !== undefined) {
      // Special case - contenteditable
      str += this.getAttribute('value') || '';
    }

    if (this.fragment) {
      str += this.fragment.toString(!/^(?:script|style)$/i.test(this.template.e)); // escape text unless script/style
    }

    str += `</${tagName}>`;
    return str;
  }

  unbind(view): void {
    const attrs = this.attributes;
    if (attrs) {
      attrs.unbinding = true;
      const len = attrs.length;
      for (let i = 0; i < len; i++) attrs[i].unbind(view);
      attrs.unbinding = false;
    }

    if (this.binding) this.binding.unbind();
    if (this.fragment) this.fragment.unbind(view);
  }

  unrender(shouldDestroy: boolean): void {
    if (!this.rendered) return;
    this.rendered = false;

    // unrendering before intro completed? complete it now
    // TODO should be an API for aborting transitions
    const transition = this.intro;
    if (transition && transition.complete) transition.complete();

    // Detach as soon as we can
    if (this.name === 'option') {
      // <option> elements detach immediately, so that
      // their parent <select> element syncs correctly, and
      // since option elements can't have transitions anyway
      this.detach();
    } else if (shouldDestroy) {
      runloop.detachWhenReady(this);
    }

    // outro transition
    const outro = this.outro;
    if (outro && outro.shouldFire('outro')) {
      outro.isIntro = false;
      outro.isOutro = true;
      runloop.registerTransition(outro);
    }

    if (this.fragment) this.fragment.unrender();

    if (this.binding) this.binding.unrender();
  }

  update(): void {
    if (this.dirty) {
      this.dirty = false;

      const attrs = this.attributes;
      if (attrs) {
        const len = attrs.length;
        for (let i = 0; i < len; i++) attrs[i].update();
      }

      if (this.fragment) this.fragment.update();
    }
  }
}

function inputIsCheckedRadio(element: Element): unknown {
  const nameAttr = element.attributeByName.name;
  return (
    element.getAttribute('type') === 'radio' &&
    (nameAttr || {}).interpolator &&
    element.getAttribute('value') === nameAttr.interpolator.model.get()
  );
}

function stringifyAttribute(attribute: Attribute): string {
  const str = attribute.toString();
  return str ? ' ' + str : '';
}

function getNamespace(element: Element): string {
  // Use specified namespace...
  const xmlns = element.getAttribute('xmlns');
  if (xmlns) return xmlns;

  // ...or SVG namespace, if this is an <svg> element
  if (element.name === 'svg') return Namespace.svg;

  const parent = element.parent;

  if (parent) {
    // ...or HTML, if the parent is a <foreignObject>
    if (parent.name === 'foreignobject') return Namespace.html;

    // ...or inherit from the parent node
    return parent.node.namespaceURI;
  }

  return element.ractive.el.namespaceURI;
}

// todo refine types
function delegateHandler(ev): boolean {
  const name = ev.type;
  const end = ev.currentTarget;
  const endEl = end._ractive && end._ractive.proxy;
  let node = ev.target;
  let bubble = true;
  let listeners;

  // starting with the origin node, walk up the DOM looking for ractive nodes with a matching event listener
  while (bubble && node && node !== end) {
    const proxy = node._ractive && node._ractive.proxy;
    if (proxy && proxy.up.delegate === endEl && shouldFire(ev, node, end)) {
      listeners = proxy.listeners && proxy.listeners[name];

      if (listeners) {
        const len = listeners.length;
        for (let i = 0; i < len; i++) bubble = listeners[i].call(node, ev) !== false && bubble;
      }
    }

    node = node.parentNode || node.correspondingUseElement; // SVG with a <use> element in certain environments
  }

  return bubble;
}

const UIEvent = win !== null ? win.UIEvent : null;
function shouldFire(event: UIEvent, start, end): boolean {
  if (UIEvent && event instanceof UIEvent) {
    let node = start;
    while (node && node !== end) {
      if (node.disabled) return false;
      node = node.parentNode || node.correspondingUseElement;
    }
  }

  return true;
}

function handler(ev: Event): void {
  const el = this._ractive.proxy;
  let listeners;
  if (el.listeners && (listeners = el.listeners[ev.type])) {
    const len = listeners.length;
    for (let i = 0; i < len; i++) listeners[i].call(this, ev);
  }
}
