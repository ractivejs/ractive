import { Adaptor } from 'types/Adaptor';
import { Decorator } from 'types/Decorator';
import { EasingFunction } from 'types/Easings';
import { EventPlugin } from 'types/Events';
import { Helper, Partial } from 'types/Generic';
import { InitOpts } from 'types/InitOptions';
import { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import { Registry } from 'types/Registries';
import { Transition } from 'types/Transition';

import Ractive$add from './prototype/add';
import Ractive$animate from './prototype/animate';
import Ractive$attachChild from './prototype/attachChild';
import Ractive$compute from './prototype/compute';
import Ractive$detach from './prototype/detach';
import Ractive$detachChild from './prototype/detachChild';
import Ractive$find from './prototype/find';
import Ractive$findAll from './prototype/findAll';
import Ractive$findAllComponents from './prototype/findAllComponents';
import Ractive$findComponent from './prototype/findComponent';
import Ractive$findContainer from './prototype/findContainer';
import Ractive$findParent from './prototype/findParent';
import Ractive$fire from './prototype/fire';
import Ractive$get from './prototype/get';
import Ractive$getContext from './prototype/getContext';
import Ractive$getLocalContext from './prototype/getLocalContext';
import Ractive$insert from './prototype/insert';
import Ractive$link from './prototype/link';
import Ractive$observe from './prototype/observe';
import Ractive$observeOnce from './prototype/observeOnce';
import Ractive$off from './prototype/off';
import Ractive$on from './prototype/on';
import Ractive$once from './prototype/once';
import Ractive$pop from './prototype/pop';
import Ractive$push from './prototype/push';
import Ractive$readLink from './prototype/readLink';
import Ractive$render from './prototype/render';
import Ractive$reset from './prototype/reset';
import Ractive$resetPartial from './prototype/resetPartial';
import Ractive$resetTemplate from './prototype/resetTemplate';
import Ractive$reverse from './prototype/reverse';
import Ractive$set from './prototype/set';
import Ractive$sort from './prototype/sort';
import Ractive$splice from './prototype/splice';
import Ractive$subtract from './prototype/subtract';
import Ractive$teardown from './prototype/teardown';
import Ractive$toggle from './prototype/toggle';
import Ractive$toHTML from './prototype/toHTML';
import Ractive$toText from './prototype/toText';
import Ractive$transition from './prototype/transition';
import Ractive$unlink from './prototype/unlink';
import Ractive$unrender from './prototype/unrender';
import Ractive$unshift from './prototype/unshift';
import Ractive$update from './prototype/update';
import Ractive$updateModel from './prototype/updateModel';
import Ractive$use from './prototype/use';
import { RactiveInternal } from './RactiveInternal';
import { InterpolatorFunction } from './static/interpolators';

export interface RactiveConstructor extends Function {
  attributes: {
    required: any;
    optional: any;
    mapAll: boolean;
  };
}

// TODO add documentation on all fields
export class Ractive<T extends Ractive<T> = Ractive<any>> extends RactiveInternal {
  public static readonly VERSION = '';

  /** When true, causes Ractive to emit warnings. Defaults to true. */
  public static DEBUG: boolean;

  public name: string;

  public target: HTMLElement | string;

  public cssId: string;

  public parent: this;

  /** if instance is detached it will be a DocumentFragment otherwise an HTML element */
  public el: RactiveHTMLElement | DocumentFragment;

  public append: boolean;

  public enhance: boolean;

  public transitionsEnabled: boolean;

  public isolated: boolean;

  public warnAboutAmbiguity: boolean;

  public resolveInstanceMembers: boolean;

  public root: this;

  public defaults: any;

  public easing: Record<string, EasingFunction>;

  public allowExpressions: boolean;

  public syncComputedChildren: boolean;

  public noIntro: boolean;
  public noOutro: boolean;
  public nestedTransitions: boolean;

  adaptors: Registry<Adaptor>;
  components: Registry<any>;
  decorators: Registry<Decorator<T>>;
  easings: Registry<EasingFunction>;
  events: Registry<EventPlugin<T>>;
  interpolators: Registry<InterpolatorFunction>;
  helpers: Registry<Helper>;
  partials: Registry<Partial>;
  transitions: Registry<Transition>;

  add = Ractive$add;

  attachChild = Ractive$attachChild;

  /**
   * Similar to `ractive.set()`, this will update the data and re-render any affected mustaches and
   * notify observers.
   * All animations are handled by a global timer that is shared between Ractive instances (and which
   * only runs if there are one or more animations still in progress), so you can trigger as many
   * separate animations as you like without worrying about timer congestion.
   * Where possible, requestAnimationFrame is used rather than setTimeout.
   *
   * Numeric values and strings that can be parsed as numeric values can be interpolated. Objects and
   * arrays containing numeric values (or other objects and arrays which themselves contain numeric
   * values, and so on recursively) are also interpolated.
   * Note that there is currently no mechanism for detecting cyclical structures! Animating to a value
   * that indirectly references itself will cause an infinite loop.
   *
   * Future versions of Ractive may include string interpolators -
   *  e.g. for SVG paths, colours, transformations and so on, a la D3 -
   * and the ability to pass in your own interpolator.
   *
   * If an animation is started on a keypath which is already being animated, the first animation
   * is cancelled.
   * (Currently, there is no mechanism in place to prevent collisions between
   * e.g. `ractive.animate('foo', { bar: 1 })` and `ractive.animate('foo.bar', 0)`.)
   *
   * @example ractive.animate(keypath, value[, options])
   *
   * @param keypath The keypath to animate.
   * @param value The value to animate to.
   * @param options
   *
   * @returns Returns a Promise which resolves with the target value and has an additional stop method,
   * which cancels the animation.
   */
  animate = Ractive$animate;

  compute = Ractive$compute;

  detach = Ractive$detach;

  detachChild = Ractive$detachChild;

  /**
   * Returns the first element inside a given Ractive instance matching a CSS selector.
   * This is similar to doing `this.el.querySelector(selector)` (though it doesn't actually use `querySelector()`).
   *
   * @example
   *
   * ```
   * var r = Ractive({
   *   el: '#main',
   *   template: '#tpl'
   * })
   *
   * setTimeout(() => {
   *   var p = r.find('p.target')
   *   console.log(p.outerHTML)
   * }, 1000)
   * ```
   *
   * @param selector A CSS selector representing the element to find.
   * @param options
   */
  find = Ractive$find;

  findAll = Ractive$findAll;

  findContainer = Ractive$findContainer;

  /**
   * Returns the first component inside a given Ractive instance with the given `name` (or the first component of any kind if no name is given).
   *
   * @example
   * ```
   * var Component = Ractive.extend({
   *   template: 'Component {{number}}'
   * })
   *
   * var r = Ractive({
   *   el: '#main',
   *   template: '#tpl',
   *   components: {
   *     Component: Component
   *   }
   * })
   *
   * setTimeout(() => {
   *   var c = r.findComponent('Component')
   *   console.log(c.toHTML())
   * }, 1000)
   * ```
   *
   * @param name The name of the component to find.
   * @param options
   */
  findComponent = Ractive$findComponent;

  findAllComponents = Ractive$findAllComponents;

  findParent = Ractive$findParent;

  fire = Ractive$fire;

  get = Ractive$get;

  getContext = Ractive$getContext;

  getLocalContext = Ractive$getLocalContext;

  insert = Ractive$insert;

  link = Ractive$link;

  observe = Ractive$observe;

  observeOnce = Ractive$observeOnce;

  on = Ractive$on;

  once = Ractive$once;

  off = Ractive$off;

  pop = Ractive$pop;

  push = Ractive$push;

  render = Ractive$render;

  readLink = Ractive$readLink;

  reverse = Ractive$reverse;

  reset = Ractive$reset;

  resetPartial = Ractive$resetPartial;

  resetTemplate = Ractive$resetTemplate;

  set = Ractive$set;

  shift = Ractive$unshift;

  sort = Ractive$sort;

  splice = Ractive$splice;

  subtract = Ractive$subtract;

  teardown = Ractive$teardown;

  /**
   * Returns a chunk of HTML representing the current state of the instance.
   * This is most useful when you're using Ractive in node.js, as it allows
   * you to serve fully-rendered pages (good for SEO and initial pageload performance) to the client.
   */
  toHTML = Ractive$toHTML;

  toggle = Ractive$toggle;

  toText = Ractive$toText;

  transition = Ractive$transition;

  unlink = Ractive$unlink;

  unrender = Ractive$unrender;

  unshift = Ractive$unshift;

  update = Ractive$update;

  updateModel = Ractive$updateModel;

  use = Ractive$use;
}
