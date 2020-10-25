import TemplateItemType from 'config/types';
import type { GenericAttributeTemplateItem } from 'parse/converters/element/elementDefinitions';
import { updateAnchors } from 'shared/anchors';
import type Context from 'shared/Context';
import getRactiveContext from 'shared/getRactiveContext';
import { bind, render as callRender, unbind, unrender, update } from 'shared/methodCallers';
import runloop from 'src/global/runloop';
import parser from 'src/Ractive/config/runtime-parser';
import construct from 'src/Ractive/construct';
import initialise from 'src/Ractive/initialise';
import { teardown } from 'src/Ractive/prototype/teardown';
import render from 'src/Ractive/render';
import { createDocumentFragment } from 'utils/dom';
import { isArray, isString } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { assign, create } from 'utils/object';

import createItem from './createItem';
import ConditionalAttribute, { ConditionalAttributeOwner } from './element/ConditionalAttribute';
import type EventDirective from './shared/EventDirective';
import type { EventDirectiveOwner } from './shared/EventDirective';
import Item, { ItemOpts } from './shared/Item';

export default class Component
  extends Item
  implements EventDirectiveOwner, ConditionalAttributeOwner {
  private isAnchor: boolean;
  private name: string;
  private extern: boolean;

  public attributes: Item[];
  public attributeByName: Record<string, Item>;

  public _partials: any;
  public item: Item;
  public instance: any;
  public eventHandlers: any[]; // TODO this array is never edited maybe we can remove it?
  public mappings: any[]; // TODO this array is never edited maybe we can remove it?
  public rendered: boolean;
  public bound: boolean;
  public target: HTMLElement;
  public occupants: HTMLElement[];
  public shouldDestroy: boolean;
  public addChild: Function;
  public removeChild: Function;

  public events: EventDirective[];

  constructor(options: ItemOpts, ComponentConstructor) {
    super(options);

    let template = options.template;
    this.isAnchor = template.t === TemplateItemType.ANCHOR;
    // override ELEMENT from super
    this.type = this.isAnchor ? TemplateItemType.ANCHOR : TemplateItemType.COMPONENT;
    let attrs = template.m;

    const partials = template.p || {};
    if (!('content' in partials)) partials.content = template.f || [];
    this._partials = partials; // TEMP

    if (this.isAnchor) {
      this.name = template.n;

      this.addChild = addChild;
      this.removeChild = removeChild;
    } else {
      const instance = create(ComponentConstructor.prototype);

      this.instance = instance;
      this.name = template.e;

      if (instance.el || instance.target) {
        warnIfDebug(
          `The <${this.name}> component has a default '${
            instance.el ? 'el' : 'target'
          }' property; it has been disregarded`
        );
        instance.el = instance.target = null;
      }

      // find container
      let fragment = options.up;
      let container;
      while (fragment) {
        if (fragment.owner.type === TemplateItemType.YIELDER) {
          container = fragment.owner.container;
          break;
        }

        fragment = fragment.parent;
      }

      // add component-instance-specific properties
      instance.parent = this.up.ractive;
      instance.container = container || null;
      instance.root = instance.parent.root;
      instance.component = this;

      construct(this.instance, { partials });

      // these can be modified during construction
      template = this.template;
      attrs = template.m;

      // allow components that are so inclined to add programmatic mappings
      if (isArray(this.mappings)) {
        attrs = (attrs || []).concat(this.mappings);
      } else if (isString(this.mappings)) {
        // TODO this function returns an array of attribute template item, Ractive or Child. We need to refine the type
        type P = GenericAttributeTemplateItem | any;
        const parsedMappings = parser.parse<P>(this.mappings, { attributes: true });
        attrs = (attrs || []).concat(parsedMappings.t);
      }

      // for hackability, this could be an open option
      // for any ractive instance, but for now, just
      // for components and just for ractive...
      instance._inlinePartials = partials;
    }

    this.attributeByName = {};
    this.attributes = [];

    if (attrs) {
      const leftovers = [];
      attrs.forEach(template => {
        switch (template.t) {
          case TemplateItemType.ATTRIBUTE:
          case TemplateItemType.EVENT:
            this.attributes.push(
              createItem({
                owner: this,
                up: this.up,
                template
              })
            );
            break;

          case TemplateItemType.TRANSITION:
          case TemplateItemType.BINDING_FLAG:
          case TemplateItemType.DECORATOR:
            break;

          default:
            leftovers.push(template);
            break;
        }
      });

      if (leftovers.length) {
        this.attributes.push(
          new ConditionalAttribute({
            owner: this,
            up: this.up,
            template: leftovers
          })
        );
      }
    }

    this.eventHandlers = [];
  }

  bind(): void {
    if (!this.isAnchor) {
      this.attributes.forEach(bind);
      this.eventHandlers.forEach(bind);

      initialise(
        this.instance,
        {
          partials: this._partials
        },
        {
          cssIds: this.up.cssIds
        }
      );

      if (this.instance.target || this.instance.el) this.extern = true;

      this.bound = true;
    }
  }

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;
      this.up.bubble();
    }
  }

  destroyed(): void {
    if (!this.isAnchor && this.instance.fragment) this.instance.fragment.destroyed();
  }

  detach(): DocumentFragment {
    if (this.isAnchor) {
      if (this.instance) return this.instance.fragment.detach();
      return createDocumentFragment();
    }

    return this.instance.fragment.detach();
  }

  find(selector, options) {
    if (this.instance) return this.instance.fragment.find(selector, options);
  }

  findAll(selector, options) {
    if (this.instance) this.instance.fragment.findAll(selector, options);
  }

  findComponent(name: string, options) {
    if (!name || this.name === name) return this.instance;

    if (this.instance.fragment) {
      return this.instance.fragment.findComponent(name, options);
    }
  }

  findAllComponents(name: string, options) {
    const { result } = options;

    if (this.instance && (!name || this.name === name)) {
      result.push(this.instance);
    }

    if (this.instance) this.instance.findAllComponents(name, options);
  }

  firstNode(skipParent) {
    if (this.instance) return this.instance.fragment.firstNode(skipParent);
  }

  getContext(...assigns): Context {
    return getRactiveContext(this.instance, ...assigns);
  }

  rebound(update: boolean): void {
    this.attributes.forEach(x => x.rebound(update));
  }

  render(target, occupants): void {
    if (this.isAnchor) {
      this.rendered = true;
      this.target = target;

      if (!checking.length) {
        checking.push(this.ractive);
        if (occupants) {
          this.occupants = occupants;
          checkAnchors();
          this.occupants = null;
        } else {
          runloop.scheduleTask(checkAnchors, true);
        }
      }
    } else {
      this.attributes.forEach(callRender);
      this.eventHandlers.forEach(callRender);

      if (this.extern) {
        this.instance.delegate = false;
        this.instance.render();
      } else {
        render(this.instance, target, null, occupants);
      }

      this.rendered = true;
    }
  }

  shuffled(): void {
    super.shuffled();
    this.instance &&
      !this.instance.isolated &&
      this.instance.fragment &&
      this.instance.fragment.shuffled();
  }

  toString(): string {
    if (this.instance) return this.instance.toHTML();
  }

  unbind(view): void {
    if (!this.isAnchor) {
      this.bound = false;

      this.attributes.forEach(unbind);

      if (view) this.instance.fragment.unbind();
      else teardown(this.instance, () => runloop.promise());
    }
  }

  unrender(shouldDestroy: boolean): void {
    this.shouldDestroy = shouldDestroy;

    if (this.isAnchor) {
      if (this.item) unrenderItem(this, this.item);
      this.target = null;
      if (!checking.length) {
        checking.push(this.ractive);
        runloop.scheduleTask(checkAnchors, true);
      }
    } else {
      this.instance.unrender();
      this.instance.el = this.instance.target = null;
      this.attributes.forEach(unrender);
      this.eventHandlers.forEach(unrender);
    }

    this.rendered = false;
  }

  update(): void {
    this.dirty = false;
    if (this.instance) {
      this.instance.fragment.update();
      this.attributes.forEach(update);
      this.eventHandlers.forEach(update);
    }
  }
}

// TODO understand what is meta

function addChild(meta): void {
  if (this.item) this.removeChild(this.item);

  const child = meta.instance;
  meta.anchor = this;

  meta.up = this.up;
  meta.name = meta.nameOption || this.name;
  this.name = meta.name;

  if (!child.isolated) child.viewmodel.attached(this.up);

  // render as necessary
  if (this.rendered) {
    renderItem(this, meta);
  }
}

function removeChild(meta): void {
  // unrender as necessary
  if (this.item === meta) {
    unrenderItem(this, meta);
    this.name = this.template.n;
  }
}

function renderItem(anchor: Component, meta): void {
  if (!anchor.rendered) return;

  meta.shouldDestroy = false;
  meta.up = anchor.up;

  anchor.item = meta;
  anchor.instance = meta.instance;
  const nextNode = anchor.up.findNextNode(anchor);

  if (meta.instance.fragment.rendered) {
    meta.instance.unrender();
  }

  meta.partials = meta.instance.partials;
  meta.instance.partials = assign(create(meta.partials), meta.partials, anchor._partials);

  meta.instance.fragment.unbind(true);
  meta.instance.fragment.componentParent = anchor.up;
  meta.instance.fragment.bind(meta.instance.viewmodel);

  anchor.attributes.forEach(bind);
  anchor.eventHandlers.forEach(bind);
  anchor.attributes.forEach(callRender);
  anchor.eventHandlers.forEach(callRender);

  const target = anchor.up.findParentNode();
  render(meta.instance, target, target.contains(nextNode) ? nextNode : null, anchor.occupants);

  if (meta.lastBound !== anchor) {
    meta.lastBound = anchor;
  }
}

function unrenderItem(anchor: Component, meta): void {
  if (!anchor.rendered) return;

  meta.shouldDestroy = true;
  meta.instance.unrender();

  anchor.eventHandlers.forEach(unrender);
  anchor.attributes.forEach(unrender);
  anchor.eventHandlers.forEach(unbind);
  anchor.attributes.forEach(unbind);

  meta.instance.el = meta.instance.anchor = null;
  meta.instance.fragment.componentParent = null;
  meta.up = null;
  meta.anchor = null;
  anchor.item = null;
  anchor.instance = null;
}

let checking = [];
export function checkAnchors(): void {
  const list = checking;
  checking = [];

  list.forEach(updateAnchors);
}
