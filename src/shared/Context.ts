import TemplateItemType from 'config/types';
import Model, { AnimatePromise } from 'model/Model';
import runloop from 'src/global/runloop';
import { Ractive } from 'src/Ractive/Ractive';
import { Keypath } from 'types/Keypath';
import { SetOpts } from 'types/Options';
import { isNumeric, isObject, isNumber, isObjectType, isString } from 'utils/is';
import { hasOwn } from 'utils/object';
import Fragment from 'view/Fragment';
import Element from 'view/items/Element';
import Decorator from 'view/items/element/Decorator';
import EventDirective from 'view/items/shared/EventDirective';
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

export const localFragment: { f?: any } = {};

interface ContextDataOpts {
  ractive: ContextData['ractive'];
  context: ContextData['context'];
}

class ContextData extends Model {
  public adaptors: any[];
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

export default class Context {
  public fragment: Fragment;
  public element: Element;
  public node: HTMLElement;
  public ractive: Ractive;
  public root: this;
  public refire: any;
  public model: ContextData;
  public partials: any;
  public attributes: any;
  public name: string;
  public component: Ractive;
  public event: Event;

  static forRactive: (ractive: Ractive, ...assigns: unknown[]) => Context;

  constructor(fragment: Context['fragment'], element?: Context['element']) {
    this.fragment = fragment;
    this.element = element || findElement(fragment);
    this.node = this.element && this.element.node;
    this.ractive = fragment.ractive;
    this.root = this;
  }

  get decorators(): Record<string, Decorator> {
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
  add(keypath: Keypath, d: unknown, options?: SetOpts): Promise<void> {
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

  animate<T>(keypath: Keypath, value: T, options: AnimateOpts): AnimatePromise<T> {
    const model: Model = findModel(this, keypath).model;
    return protoAnimate(this.ractive, model, value, options);
  }

  find(selector) {
    return this.fragment.find(selector);
  }

  findAll(selector) {
    const result = [];
    this.fragment.findAll(selector, { result });
    return result;
  }

  findAllComponents(selector) {
    const result = [];
    this.fragment.findAllComponents(selector, { result });
    return result;
  }

  findComponent(selector) {
    return this.fragment.findComponent(selector);
  }

  // get relative keypaths and values
  get(keypath) {
    if (!keypath) return this.fragment.findContext().get(true);

    const { model } = findModel(this, keypath);

    return model ? model.get(true) : undefined;
  }

  getParent(component) {
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
    else return fragment.getContext();
  }

  hasListener(name, bubble) {
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

  link(source, dest) {
    const there = findModel(this, source).model;
    const here = findModel(this, dest).model;
    const promise = runloop.start();
    here.link(there, source);
    runloop.end();
    return promise;
  }

  listen(event, handler) {
    const el = this.element;
    el.on(event, handler);
    return {
      cancel() {
        el.off(event, handler);
      }
    };
  }

  observe(keypath, callback, options: any = {}) {
    if (isObject(keypath)) options = callback || {};
    options.fragment = this.fragment;
    return this.ractive.observe(keypath, callback, options);
  }

  observeOnce(keypath, callback, options: any = {}) {
    if (isObject(keypath)) options = callback || {};
    options.fragment = this.fragment;
    return this.ractive.observeOnce(keypath, callback, options);
  }

  pop(keypath) {
    return modelPop(findModel(this, keypath).model, []);
  }

  push(keypath, ...values) {
    return modelPush(findModel(this, keypath).model, values);
  }

  raise(name, event, ...args) {
    let el = this.element;
    let ev;

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

  readLink(keypath, options) {
    return this.ractive.readLink(this.resolve(keypath), options);
  }

  resolve(path, ractive?) {
    const { model, instance } = findModel(this, path);
    return model ? model.getKeypath(ractive || instance) : path;
  }

  reverse(keypath) {
    return modelReverse(findModel(this, keypath).model, []);
  }

  set(keypath, value, options) {
    return sharedSet(build(this, keypath, value), options);
  }

  shift(keypath) {
    return modelShift(findModel(this, keypath).model, []);
  }

  splice(keypath, index, drop, ...add) {
    add.unshift(index, drop);
    return modelSplice(findModel(this, keypath).model, add);
  }

  sort(keypath) {
    return modelSort(findModel(this, keypath).model, []);
  }

  subtract(keypath, d, options) {
    const num = isNumber(d) ? d : 1;
    const opts = isObjectType(d) ? d : options;
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

  toggle(keypath, options) {
    const { model } = findModel(this, keypath);
    return sharedSet([[model, !model.get()]], options);
  }

  unlink(dest) {
    const here = findModel(this, dest).model;
    const promise = runloop.start();
    if (here.owner && here.owner._link) here.owner.unlink();
    runloop.end();
    return promise;
  }

  unlisten(event, handler) {
    this.element.off(event, handler);
  }

  unshift(keypath, ...add) {
    return modelUnshift(findModel(this, keypath).model, add);
  }

  update(keypath, options) {
    return protoUpdate(this.ractive, findModel(this, keypath).model, options);
  }

  updateModel(keypath, cascade) {
    const { model } = findModel(this, keypath);
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

  getBindingPath(ractive) {
    const { model, instance } = this.getBindingModel(this);
    if (model) return model.getKeypath(ractive || instance);
  }

  getBinding() {
    const { model } = this.getBindingModel(this);
    if (model) return model.get(true);
  }

  getBindingModel(ctx) {
    const el = ctx.element;
    return { model: el.binding && el.binding.model, instance: el.up.ractive };
  }

  setBinding(value) {
    const { model } = this.getBindingModel(this);
    return sharedSet([[model, value]]);
  }
}

Context.forRactive = getRactiveContext;
// circular deps are fun
extern.Context = Context;

// TODO: at some point perhaps this could support relative * keypaths?
function build(ctx: Context, keypath, value) {
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

function findModel(ctx, path) {
  const frag = ctx.fragment;

  if (!isString(path)) {
    return { model: frag.findContext(), instance: path };
  }

  return { model: resolveReference(frag, path), instance: frag.ractive };
}

function findEvent(el: Element, name: string): EventDirective {
  return el.events && el.events.find && el.events.find(e => ~e.template.n.indexOf(name));
}
