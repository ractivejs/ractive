import TemplateItemType from 'config/types';
import LinkModel from 'model/LinkModel';
import Model, { AnimatePromise } from 'model/Model';
import type ModelBase from 'model/ModelBase';
import type { PartialTemplateItem } from 'parse/converters/templateItemDefinitions';
import runloop from 'src/global/runloop';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { Adaptor } from 'types/Adaptor';
import type { ContextHelper } from 'types/Context';
import type { DecoratorHandle } from 'types/Decorator';
import type { ArrayPushPromise, Keypath, ValueMap } from 'types/Generic';
import type { ListenerHandle } from 'types/Listener';
import type { GetOpts, ReadLinkOpts, SetOpts, UpdateOpts } from 'types/MethodOptions';
import { isNumeric, isObject, isNumber, isObjectType, isString } from 'utils/is';
import { hasOwn } from 'utils/object';
import type Fragment from 'view/Fragment';
import type Element from 'view/items/Element';
import type Attribute from 'view/items/element/Attribute';
import type EventDirective from 'view/items/shared/EventDirective';
import findElement from 'view/items/shared/findElement';
import resolveReference from 'view/resolvers/resolveReference';

import { animate as protoAnimate, AnimateOpts } from '../Ractive/prototype/animate';
import makeArrayMethod from '../Ractive/prototype/shared/makeArrayMethod';
import { update as protoUpdate } from '../Ractive/prototype/update';

import getRactiveContext, { extern, findParentWithContext } from './getRactiveContext';
import { set as sharedSet } from './set';

const modelPush = makeArrayMethod('push').model;
const modelPop = makeArrayMethod('pop').model;
const modelShift = makeArrayMethod('shift').model;
const modelUnshift = makeArrayMethod('unshift').model;
const modelSort = makeArrayMethod('sort').model;
const modelSplice = makeArrayMethod('splice').model;
const modelReverse = makeArrayMethod('reverse').model;

export const localFragment: { f?: Fragment } = {};

interface ContextDataOpts {
  ractive: ContextData['ractive'];
  context: ContextData['context'];
}

class ContextData extends Model {
  public adaptors: Adaptor[];
  public context: Context;

  constructor(options: ContextDataOpts) {
    super(null, null);

    this.isRoot = true;
    this.root = this;
    this.value = {};
    this.ractive = options.ractive;
    this.adaptors = [];
    this.context = options.context;
  }

  getKeypath(): Keypath {
    return '@context.data';
  }

  rebound(): void {}
}

// TODO check that params between this class and `ContextHelper` are the same
export default class Context implements ContextHelper {
  static forRactive: (ractive: Ractive, ...assigns: unknown[]) => Context;

  public fragment: Fragment;
  public element: Element;
  public node: HTMLElement;
  public ractive: Ractive;
  public root: this;
  public refire: boolean;
  public model: ContextData;
  public partials: Record<string, PartialTemplateItem[]>;
  public attributes: Attribute[];
  public name: string;
  public component: Ractive;
  public event: Event;
  public original: Event;

  constructor(fragment: Context['fragment'], element?: Context['element']) {
    this.fragment = fragment;
    this.element = element || findElement<Element>(fragment);
    this.node = this.element && this.element.node;
    this.ractive = fragment.ractive;
    this.root = this;
  }

  get decorators(): Record<string, DecoratorHandle> {
    const items = {};
    if (!this.element) return items;
    this.element.decorators.forEach(d => (items[d.name] = d.handle));
    return items;
  }

  get _data(): ContextData {
    return (
      this.model ||
      (this.root.model = new ContextData({
        ractive: this.ractive,
        context: this.root
      }))
    );
  }

  // the usual mutation suspects
  add(keypath: Keypath, d: number, options?: SetOpts): Promise<void> {
    const num = isNumber(d) ? +d : 1;
    const opts = isObjectType<SetOpts>(d) ? d : options;
    return sharedSet(
      build(this, keypath, num).map(pair => {
        const [model, val] = pair;
        const value = model.get();
        if (!isNumeric(val) || !isNumeric(value)) throw new Error('Cannot add non-numeric value');
        return [model, value + val];
      }),
      opts
    );
  }

  animate<T>(keypath: Keypath, value: T, options: AnimateOpts): AnimatePromise {
    const model = <Model>findModel(this, keypath).model;
    return protoAnimate(this.ractive, model, value, options);
  }

  find(selector: string): ReturnType<Fragment['find']> {
    return this.fragment.find(selector);
  }

  findAll(selector: string): Element[] {
    const result = [];
    this.fragment.findAll(selector, { result });
    return result;
  }

  findAllComponents(selector: string): Ractive[] {
    const result: Ractive[] = [];
    this.fragment.findAllComponents(selector, { result });
    return result;
  }

  findComponent(selector: string): Ractive {
    return this.fragment.findComponent(selector);
  }

  // get relative keypaths and values
  get(keypath: Keypath | GetOpts): unknown {
    if (!keypath) return this.fragment.findContext().get(true);

    const { model } = findModel(this, <Keypath>keypath);

    return model ? model.get(true) : undefined;
  }

  getParent(component: boolean): this {
    let fragment = this.fragment;

    if (!fragment.parent && component) fragment = fragment.componentParent;
    else {
      if (fragment.context) fragment = findParentWithContext(fragment.parent);
      else {
        fragment = findParentWithContext(fragment.parent);
        if (fragment) {
          if (!fragment.parent && component) fragment = fragment.componentParent;
          else fragment = findParentWithContext(fragment.parent);
        }
      }
    }

    if (!fragment || fragment === this.fragment) return;

    return fragment.getContext() as this;
  }

  hasListener(name: string, bubble: boolean): boolean {
    // if the owner is a component, start there because the nearest element
    // may exist outside of the immediate context (yield)
    let el = this.fragment.owner.component
      ? this.fragment.owner
      : this.element || this.fragment.owner;
    let base;

    do {
      base = el.component || el;
      if (base.template.t === TemplateItemType.ELEMENT) {
        if (findEvent(base, name)) return true;
      }
      el = el.up && el.up.owner;
      if (el && el.component) el = el.component;
    } while (el && bubble);
  }

  link(source: Keypath, dest: Keypath): Promise<void> {
    const there = findModel(this, source).model;
    const here = findModel(this, dest).model;
    const promise = runloop.start();
    here.link(<Model>there, source);
    runloop.end();
    return promise;
  }

  listen(event: string, handler: Function): ListenerHandle {
    const el = this.element;
    el.on(event, handler);
    return {
      cancel() {
        el.off(event, handler);
      }
    };
  }

  /** @see Ractive$observe for implementation */
  // eslint-disable-next-line
  observe(keypath, callback, options: any = {}) {
    if (isObject(keypath)) options = callback || {};
    options.fragment = this.fragment;
    return this.ractive.observe(keypath, callback, options);
  }

  /** @see Ractive$observe for implementation */
  // eslint-disable-next-line
  observeOnce(keypath, callback, options: any = {}) {
    if (isObject(keypath)) options = callback || {};
    options.fragment = this.fragment;
    return this.ractive.observeOnce(keypath, callback, options);
  }

  pop(keypath: Keypath): ReturnType<typeof modelPop> {
    return modelPop(findModel(this, keypath).model, []);
  }

  push(keypath: Keypath, ...values: unknown[]): ReturnType<typeof modelPush> {
    return modelPush(findModel(this, keypath).model, values);
  }

  raise(name: string, event, ...args: unknown[]): any {
    let el = this.element;
    let ev: EventDirective;

    while (el) {
      if (el.component) el = el.component;
      ev = findEvent(el, name);
      if (ev) {
        return ev.fire(
          ev.element.getContext(
            event || {},
            event && !('original' in event) ? { original: {} } : {}
          ),
          args
        );
      }

      el = el.up && el.up.owner;
    }
  }

  readLink(keypath: Keypath, options: ReadLinkOpts): ReturnType<Ractive['readLink']> {
    return this.ractive.readLink(this.resolve(keypath), options);
  }

  resolve(path: Keypath, ractive?: Ractive): Keypath {
    const { model, instance } = findModel(this, path);
    return model ? model.getKeypath(ractive || instance) : path;
  }

  reverse(keypath: Keypath): ReturnType<typeof modelReverse> {
    return modelReverse(findModel(this, keypath).model, []);
  }

  set(keypath: Keypath | ValueMap, value: ValueMap | unknown, options?: SetOpts): Promise<void> {
    return sharedSet(build(this, keypath, value), options);
  }

  shift(keypath: Keypath): ReturnType<typeof modelShift> {
    return modelShift(findModel(this, keypath).model, []);
  }

  splice(
    keypath: Keypath,
    index: number,
    drop: number,
    ...add: unknown[]
  ): ReturnType<typeof modelSplice> {
    add.unshift(index, drop);
    return modelSplice(findModel(this, keypath).model, add);
  }

  sort(keypath: Keypath): ReturnType<typeof modelSort> {
    return modelSort(findModel(this, keypath).model, []);
  }

  subtract(keypath: Keypath, d: number, options?: SetOpts): Promise<void> {
    const num = isNumber(d) ? d : 1;
    const opts = isObjectType<SetOpts>(d) ? d : options;
    return sharedSet(
      build(this, keypath, num).map(pair => {
        const [model, val] = pair;
        const value = model.get();
        if (!isNumeric(val) || !isNumeric(value)) throw new Error('Cannot add non-numeric value');
        return [model, value - val];
      }),
      opts
    );
  }

  toggle(keypath: Keypath): Promise<boolean> {
    const { model } = findModel(this, keypath);
    return sharedSet([[model, !model.get()]]);
  }

  unlink(dest: string): Promise<void> {
    const here = findModel(this, dest).model;
    const promise = runloop.start();
    // TSRChange - change guard with instanceof
    if (here instanceof LinkModel && here.owner?._link) here.owner.unlink();
    runloop.end();
    return promise;
  }

  unlisten(event: string, handler: Function): void {
    this.element.off(event, handler);
  }

  unshift(keypath: Keypath, ...add: unknown[]): ArrayPushPromise {
    return modelUnshift(findModel(this, keypath).model, add);
  }

  update(keypath: Keypath | UpdateOpts, options?: UpdateOpts): ReturnType<typeof protoUpdate> {
    return protoUpdate(this.ractive, findModel(this, <Keypath>keypath).model, options);
  }

  updateModel(keypath: Keypath | boolean, cascade?: boolean): Promise<void> {
    const { model } = findModel(this, <Keypath>keypath);
    const promise = runloop.start();
    model.updateFromBindings(cascade);
    runloop.end();
    return promise;
  }

  // two-way binding related helpers
  isBound(): boolean {
    const { model } = this.getBindingModel(this);
    return !!model;
  }

  getBindingPath(ractive: Ractive): Keypath {
    const { model, instance } = this.getBindingModel(this);
    if (model) return model.getKeypath(ractive || instance);
  }

  getBinding(): unknown {
    const { model } = this.getBindingModel(this);
    if (model) return model.get(true);
  }

  getBindingModel(ctx: this): { model: ModelBase; instance: Ractive } {
    const el = ctx.element;
    return { model: el.binding?.model, instance: el.up.ractive };
  }

  setBinding<T>(value: T): Promise<T> {
    const { model } = this.getBindingModel(this);
    return sharedSet([[model, value]]);
  }
}

Context.forRactive = getRactiveContext;
// circular deps are fun
extern.Context = Context;

// TODO: at some point perhaps this could support relative * keypaths?
function build(ctx: Context, keypath: ValueMap | string, value: unknown): [ModelBase, unknown][] {
  const sets = [];

  // set multiple keypaths in one go
  if (isObject(keypath)) {
    for (const k in keypath) {
      if (hasOwn(keypath, k)) {
        sets.push([findModel(ctx, k).model, keypath[k]]);
      }
    }
  } else {
    // set a single keypath
    sets.push([findModel(ctx, keypath).model, value]);
  }

  return sets;
}

function findModel(
  ctx: Context,
  path: Ractive | string
): { model: ModelBase | any; instance: Ractive } {
  const frag = ctx.fragment;

  if (!isString(path)) {
    return { model: frag.findContext(), instance: path };
  }

  return { model: resolveReference(frag, path), instance: frag.ractive };
}

function findEvent(el: Element, name: string): EventDirective {
  return el?.events?.find && el.events.find(e => ~e.template.n.indexOf(name));
}
