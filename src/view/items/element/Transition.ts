import { win } from 'config/environment';
import { missingPlugin } from 'config/errors';
import { visible } from 'config/visibility';
import {
  TransitionDirectiveTemplateItem,
  TransitionTrigger
} from 'parse/converters/element/elementDefinitions';
import { findInViewHierarchy } from 'shared/registry';
import TransitionManager from 'src/global/TransitionManager';
import { RactiveFake } from 'types/RactiveFake';
import { Transition as TransitionFunction } from 'types/Transition';
import { ValueMap } from 'types/ValueMap';
import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isObject, isFunction, isNumber, isString, isUndefined } from 'utils/is';
import { warnOnceIfDebug } from 'utils/log';
import noop from 'utils/noop';
import { assign, hasOwn, keys } from 'utils/object';
import Fragment from 'view/Fragment';

import Element from '../Element';
import { resolveArgs, setupArgsFn } from '../shared/directiveArgs';
import findElement from '../shared/findElement';
import Item from '../shared/Item';

import createTransitions from './transitions/createTransitions';
import prefix from './transitions/prefix';

const getComputedStyle = win && win.getComputedStyle;
const resolved = Promise.resolve();

const names = {
  t0: 'intro-outro',
  t1: 'intro',
  t2: 'outro'
};

interface TransitionOpts {
  owner: Transition['owner'];
  up: Transition['up'];
  template: Transition['template'];

  name?: Transition['name'];
  params?: Transition['params'];
}

/** Section | Element */
export interface TransitionOwner extends Item {
  ractive: RactiveFake;
}

export default class Transition {
  private owner: TransitionOwner;
  public element: Element;
  public ractive: RactiveFake;
  private template: TransitionDirectiveTemplateItem;
  private up: Fragment;
  private options: TransitionOpts;
  private onComplete: Function[];
  public complete: Function;
  public isIntro: boolean;
  public isOutro: boolean;
  public starting: boolean;

  public node: HTMLElement;
  private originals: Record<string, string | number>;
  private targets: Record<string, string | number>;
  public eventName: string;
  public name: string | TransitionFunction;
  private _fn: TransitionFunction;
  public _manager: TransitionManager;
  public fn: Function;
  private params: ValueMap;

  constructor(options: TransitionOpts) {
    this.owner = options.owner || options.up.owner || findElement(options.up);
    // TSRChange - changed check using in to avoid errors related to type
    this.element = 'attributeByName' in this.owner ? this.owner : findElement(options.up);
    this.ractive = this.owner.ractive;
    this.template = options.template;
    this.up = options.up;
    this.options = options;
    this.onComplete = [];
  }

  animateStyle(style, value, options): Promise<void> {
    if (arguments.length === 4) {
      throw new Error(
        't.animateStyle() returns a promise - use .then() instead of passing a callback'
      );
    }

    // Special case - page isn't visible. Don't animate anything, because
    // that way you'll never get CSS transitionend events
    if (!visible) {
      this.setStyle(style, value);
      return resolved;
    }

    let to;

    if (isString(style)) {
      to = {};
      to[style] = value;
    } else {
      to = style;

      // shuffle arguments
      options = value;
    }

    return new Promise(fulfil => {
      // Edge case - if duration is zero, set style synchronously and complete
      if (!options.duration) {
        this.setStyle(to);
        fulfil();
        return;
      }

      // Get a list of the properties we're animating
      const propertyNames = keys(to);
      const changedProperties = [];

      // Store the current styles
      const computedStyle = getComputedStyle(this.node);

      let i = propertyNames.length;
      while (i--) {
        const prop = propertyNames[i];
        const name = prefix(prop);

        const current = computedStyle[prefix(prop)];

        // record the starting points
        const init = this.node.style[name];
        if (!(name in this.originals)) this.originals[name] = this.node.style[name];
        this.node.style[name] = to[prop];
        this.targets[name] = this.node.style[name];
        this.node.style[name] = init;

        // we need to know if we're actually changing anything
        if (current != to[prop]) {
          // use != instead of !==, so we can compare strings with numbers
          changedProperties.push(name);

          // if we happened to prefix, make sure there is a properly prefixed value
          to[name] = to[prop];

          // make the computed style explicit, so we can animate where
          // e.g. height='auto'
          this.node.style[name] = current;
        }
      }

      // If we're not actually changing anything, the transitionend event
      // will never fire! So we complete early
      if (!changedProperties.length) {
        fulfil();
        return;
      }

      createTransitions(this, to, options, changedProperties, fulfil);
    });
  }

  bind(): void {
    const options = this.options;
    const type = options.template && options.template.v;
    if (type) {
      if (type === 't0' || type === 't1') this.element.intro = this;
      if (type === 't0' || type === 't2') this.element.outro = this;
      this.eventName = names[type];
    }

    const ractive = this.owner.ractive;

    this.name = options.name || options.template.n;

    if (options.params) {
      this.params = options.params;
    }

    if (isFunction(this.name)) {
      this._fn = this.name;
      this.name = this._fn.name;
    } else {
      this._fn = findInViewHierarchy('transitions', ractive, this.name);
    }

    if (!this._fn) {
      warnOnceIfDebug(missingPlugin(this.name, 'transition'), { ractive });
    }

    setupArgsFn(this, options.template);
  }

  getParams() {
    if (this.params) return this.params;

    // get expression args if supplied
    if (this.fn) {
      const values = resolveArgs(this, this.template, this.up).map(model => {
        if (!model) return undefined;

        return model.get();
      });
      return this.fn.apply(this.ractive, values);
    }
  }

  getStyle(props: string | ValueMap): string | ValueMap {
    const computedStyle = getComputedStyle(this.node);

    if (isString(props)) {
      return computedStyle[prefix(props)];
    }

    if (!isArray(props)) {
      throw new Error(
        'Transition$getStyle must be passed a string, or an array of strings representing CSS properties'
      );
    }

    const styles = {};

    let i = props.length;
    while (i--) {
      const prop = props[i];
      let value = computedStyle[prefix(prop)];

      if (value === '0px') value = '0';
      styles[prop] = value;
    }

    return styles;
  }

  processParams(params: ValueMap | number | string, defaults: ValueMap): ValueMap {
    if (isNumber(params)) {
      params = { duration: params };
    } else if (isString(params)) {
      if (params === 'slow') {
        params = { duration: 600 };
      } else if (params === 'fast') {
        params = { duration: 200 };
      } else {
        params = { duration: 400 };
      }
    } else if (!params) {
      params = {};
    }

    return assign({}, defaults, params);
  }

  registerCompleteHandler(fn: Transition['onComplete'][0]): void {
    addToArray(this.onComplete, fn);
  }

  setStyle(style: string | ValueMap, value?): this {
    if (isString(style)) {
      const name = prefix(style);
      if (!hasOwn(this.originals, name)) this.originals[name] = this.node.style[name];
      this.node.style[name] = value;
      this.targets[name] = this.node.style[name];
    } else {
      let prop;
      for (prop in style) {
        if (hasOwn(style, prop)) {
          this.setStyle(prop, style[prop]);
        }
      }
    }

    return this;
  }

  shouldFire(type: 'intro' | 'outro'): boolean {
    if (!this.ractive.transitionsEnabled) return false;

    // check for noIntro and noOutro cases, which only apply when the owner ractive is rendering and unrendering, respectively
    if (type === 'intro' && this.ractive.rendering && nearestProp('noIntro', this.ractive, true))
      return false;
    if (type === 'outro' && this.ractive.unrendering && nearestProp('noOutro', this.ractive, false))
      return false;

    const params = this.getParams(); // this is an array, the params object should be the first member
    // if there's not a parent element, this can't be nested, so roll on
    if (!this.element.parent) return true;

    // if there is a local param, it takes precedent
    if (params && params[0] && isObject(params[0]) && 'nested' in params[0]) {
      if (params[0].nested !== false) return true;
    } else {
      // use the nearest instance setting
      // find the nearest instance that actually has a nested setting
      if (nearestProp('nestedTransitions', this.ractive) !== false) return true;
    }

    // check to see if this is actually a nested transition
    let el = this.element.parent;
    while (el) {
      if (el[type] && el[type].starting) return false;
      el = el.parent;
    }

    return true;
  }

  start(): void {
    const node = (this.node = this.element.node);
    const originals = (this.originals = {}); //= node.getAttribute( 'style' );
    const targets = (this.targets = {});

    let completed;
    const args = this.getParams();

    // create t.complete() - we don't want this on the prototype,
    // because we don't want `this` silliness when passing it as
    // an argument
    this.complete = noReset => {
      this.starting = false;
      if (completed) {
        return;
      }

      this.onComplete.forEach(fn => fn());
      if (!noReset && this.isIntro) {
        for (const k in targets) {
          if (node.style[k] === targets[k]) node.style[k] = originals[k];
        }
      }

      this._manager.remove(this);

      completed = true;
    };

    // If the transition function doesn't exist, abort
    if (!this._fn) {
      this.complete();
      return;
    }

    const promise = this._fn.apply(this.ractive, [this].concat(args));
    if (promise) promise.then(this.complete);
  }

  toString(): string {
    return '';
  }

  unbind(): void {
    if (!this.element.attributes.unbinding) {
      const type = this.options && this.options.template && this.options.template.v;
      if (type === TransitionTrigger.INTRO_OUTRO || type === TransitionTrigger.INTRO)
        this.element.intro = null;
      if (type === TransitionTrigger.INTRO_OUTRO || type === TransitionTrigger.OUTRO)
        this.element.outro = null;
    }
  }

  unregisterCompleteHandler(fn: Transition['onComplete'][0]): void {
    removeFromArray(this.onComplete, fn);
  }

  destroyed = noop;
  firstNode = noop;
  rebound = noop;
  render = noop;
  unrender = noop;
  update = noop;
}

// const proto = Transition.prototype;
// proto.destroyed = proto.firstNode = proto.rebound = proto.render = proto.unrender = proto.update = noop;

function nearestProp<P extends 'noIntro' | 'noOutro' | 'nestedTransitions'>(
  prop: P,
  ractive: RactiveFake,
  rendering?: boolean
): RactiveFake[P] {
  let instance = ractive;
  while (instance) {
    if (
      hasOwn(instance, prop) &&
      (isUndefined(rendering) || rendering ? instance.rendering : instance.unrendering)
    )
      return instance[prop];
    instance = instance.component && instance.component.ractive;
  }

  return ractive[prop];
}