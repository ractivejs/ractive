import type Computation from 'model/Computation';
import type RootModel from 'model/RootModel';
import type CSSModel from 'model/specials/CSSModel';
import type { PartialTemplateItem } from 'parse/converters/templateItemDefinitions';
import type Context from 'shared/Context';
import type { FakeFragment } from 'shared/getRactiveContext';
import { extend, extendWith } from 'src/extend/_extend';
import type { Adaptor } from 'types/Adaptor';
import type { Decorator } from 'types/Decorator';
import type { EasingFunction } from 'types/Easings';
import type { EventPlugin } from 'types/Events';
import type { Children, CssFn, Data, Helper, Meta, Partial, ValueMap } from 'types/Generic';
import type { InitOpts } from 'types/InitOptions';
import type { EventListenerEntry, ListenerCallback, ListenerDescriptor } from 'types/Listener';
import type { Macro } from 'types/Macro';
import type { ObserverCallback, ObserverDescriptor } from 'types/Observer';
import type { Template } from 'types/Parse';
import type { RactiveHTMLElement } from 'types/RactiveHTMLElement';
import type { Registry } from 'types/Registries';
import type { Transition } from 'types/Transition';
import type Fragment from 'view/Fragment';
import type Element from 'view/items/Element';
import type Binding from 'view/items/element/binding/Binding';

import type { CSSDefinition } from './config/custom/css/css';
import type { RactiveDynamicTemplate } from './config/custom/template';
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
import Ractive$observe, { InternalObserver } from './prototype/observe';
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
import getContext from './static/getContext';
import type { InterpolatorFunction } from './static/interpolators';
import isInstance from './static/isInstance';
import sharedGet from './static/sharedGet';
import sharedSet from './static/sharedSet';
import styleGet from './static/styleGet';
import setCSSData from './static/styleSet';
import use from './static/use';

export interface RactiveConstructor extends Function {
  _cssIds: string[];
  _cssModel: CSSModel;
  attributes: {
    required: string[];
    optional: string[];
    mapAll: boolean;
  };
}

interface RactiveInternalConfig {
  template?: RactiveDynamicTemplate;
}

/**
 * Internal properties of Ractive
 * @internal
 */
class RactiveInternal {
  /** @internal */
  fragment: Fragment;

  /** @internal */
  _fakeFragment: FakeFragment;

  /** @internal */
  torndown: boolean;

  /** @internal */
  rendering: boolean;

  /** @internal*/
  rendered: boolean;

  /** @internal */
  unrendering: boolean;

  /** @internal */
  shouldDestroy: boolean;

  /** @internal */
  destroyed: boolean;

  /** @internal */
  isDetached: boolean;

  /** @internal */
  anchor: HTMLElement;

  /** @internal */
  _guid: string;

  /** @internal */
  _eventQueue: Context[];

  /** @internal */
  event: Context;

  /** @internal */
  _nsSubs: number;

  /** @internal */
  _subs: Record<string, EventListenerEntry[]>;

  /** @internal*/
  _children: Children;

  /** @internal */
  viewmodel: RootModel;

  /** @internal*/
  instance: this;

  /** @internal */
  _observers: InternalObserver[];

  /**
   * Store computation information. Item can also be a {@link InternalComputationDescription}
   * @internal
   */
  computed: Record<string, Computation>;

  /** @internal */
  template: Template;

  /** @internal */
  _config: RactiveInternalConfig;

  /** @internal */
  partials: Record<string, Partial>;

  /** @internal */
  _attributePartial: PartialTemplateItem;

  /** @internal */
  component: Meta;

  /** @internal */
  proxy: Element;

  /** @internal */
  delegate: boolean;

  /** @internal */
  data: Data;

  /** @internal */
  value: any;

  /** @internal */
  adapt: (Adaptor | string)[];

  /** @internal */
  _cssModel: CSSModel;

  /** @internal */
  _cssDef: CSSDefinition;

  /** @internal */
  extensions: Macro[];

  /** @internal */
  binding: Binding;
}

// TODO add documentation on all fields
export class Ractive<T extends Ractive<T> = Ractive<never>> extends RactiveInternal {
  public static readonly VERSION = '';

  /** When true, causes Ractive to emit warnings. Defaults to true. */
  public static DEBUG = true;
  public static DEBUG_PROMISES = true;
  public static WELCOME_MESSAGE: false | string;

  public static Parent: typeof Ractive;
  public static Ractive: typeof Ractive;

  public static defaults: any;

  constructor(options: InitOpts) {
    super();

    // TODO implement constructor
    options;
  }

  public name: string;

  public target: HTMLElement | string;

  public container: this;

  public children: Children;

  public css: string | CssFn;

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

  public cssData: ValueMap;

  public noIntro: boolean;
  public noOutro: boolean;
  public nestedTransitions: boolean;

  public lazy: boolean | number;

  public twoway: boolean;

  adaptors: Registry<Adaptor>;
  components: Registry<Component>;
  decorators: Registry<Decorator<T>>;
  easings: Registry<EasingFunction>;
  events: Registry<EventPlugin<T>>;
  interpolators: Registry<InterpolatorFunction>;
  helpers: Registry<Helper>;
  partials: Registry<Partial>;
  transitions: Registry<Transition>;

  add = Ractive$add;

  attachChild = Ractive$attachChild;

  animate = Ractive$animate;

  compute = Ractive$compute;

  detach = Ractive$detach;

  detachChild = Ractive$detachChild;

  find = Ractive$find;

  findAll = Ractive$findAll;

  findContainer = Ractive$findContainer;

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

export interface Constructor<T extends Ractive<T>, U extends InitOpts<T> = InitOpts<T>> {
  new (opts?: U): T;
}

export type Component = typeof Static | Promise<typeof Static>;

export class Static<T extends Ractive<T> = Ractive> extends Ractive<T> {
  /** Create a new component with this constructor as a starting point. */
  static extend = extend;

  /** Create a new component with this constructor as a starting point using the given constructor. */
  static extendWith = extendWith;

  /** Get a Context for the given node or selector. */
  static getContext = getContext;

  /** @returns true if the given object is an instance of this constructor */
  static isInstance = isInstance;

  /** Get the value at the given keypath from the Ractive shared store. */
  static sharedGet = sharedGet;
  /** Set the given keypath in the Ractive shared store to the given value. */
  static sharedSet = sharedSet;

  /** Get the css data for this constructor at the given keypath. */
  static styleGet = styleGet;
  /** Set the css data for this constructor at the given keypath to the given value. */
  static styleSet = setCSSData;

  /** Install one or more plugins on the component.  */
  static use = use;

  /** The Ractive constructor used to create this constructor. */
  static Ractive: typeof Ractive;
  /** The parent constructor used to create this constructor. */
  static Parent: typeof Static;

  /** @internal */
  static _on: [string, ListenerCallback | ListenerDescriptor][];

  /** @internal */
  static _observe: [string, ObserverCallback | ObserverDescriptor][];

  static extensions: typeof Static[];

  static attributes: { optional?: string[]; required?: string[] };

  static cssData: ValueMap;
  static cssId: string;
  static _cssIds: string[];
  static _cssModel: CSSModel;
  static _cssDef: CSSDefinition;

  static default: any;

  static _fn: Function;

  static css?: string | CssFn;
}
