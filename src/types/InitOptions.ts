import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type Component from 'view/items/Component';
import type Interpolator from 'view/items/Interpolator';

import type { Adaptor } from './Adaptor';
import type { Computation } from './Computation';
import type { Decorator } from './Decorator';
import type { EasingFunction } from './Easings';
import type { EventPlugin } from './Events';
import type {
  CssFn,
  Data,
  DataFn,
  PluginExtend,
  PluginInstance,
  Target,
  ValueMap,
  Partial,
  Helper
} from './Generic';
import type { ListenerCallback, ListenerDescriptor } from './Listener';
import type { ObserverCallback, ObserverDescriptor } from './Observer';
import type { BaseParseOpts, Template } from './Parse';
import type { Registry } from './Registries';
import type { Transition } from './Transition';

export interface BaseInitOpts<T extends Ractive<T> = Ractive> extends BaseParseOpts {
  /** Adaptors to be applied. */
  adapt?: (Adaptor | string)[];

  /** A map of adaptors. */
  adaptors?: Registry<Adaptor>;

  /** If set to false, disallow expressions in the template. */
  allowExpressions?: boolean;

  /** If true, this instance can occupy the target element with other existing instances rather than cause them to unrender. */
  append?: boolean;

  /* A map of components */
  components?: Registry<Component>;

  /** A map of computations */
  computed?: Record<string, Computation<T>>;

  /** A map of decorators */
  decorators?: Registry<Decorator<T>>;

  /** Whether or not to use event delegation around suitabe iterative sections. Defaults to true. */
  delegate?: boolean;

  /** A map of easings */
  easing?: Registry<EasingFunction>;

  /** A map of custom events */
  events?: Registry<EventPlugin<T>>;

  /** A map of helper functions */
  helpers?: Registry<Helper>; // TODO replace with Helper

  /** A map of interpolators for use with animate */
  interpolators?: Registry<Interpolator>;

  /** Whether or not twoway bindings default to lazy. */
  lazy?: boolean;

  /** Whether or not an element can transition if one of its parent elements is also transitioning. */
  nestedTransitions?: boolean;

  /** Whether or not to skip element intro transitions when the instance is being rendered initially. */
  noIntro?: boolean;

  /** Whether or not to skip outro transitions when the instance is being unrendered. */
  noOutro?: boolean;

  /** A map of observers */
  observe?: Registry<ObserverCallback<T> | ObserverDescriptor<T>>;

  /** A map of event listeners */
  on?: Registry<ListenerCallback<T> | ListenerDescriptor<T>>;

  /** A map of partials */
  partials?: Registry<Partial>;

  /** Whether or not to consider instance members like set when resolving values in the template. */
  resolveInstanceMembers?: boolean;

  /** Whether or not to invalidate computation dependencies when a computed value or one of its children is set. */
  syncComputedChildren?: boolean;

  /** The template to use when rendering. */
  template?: Template;

  /** A map of transitions */
  transitions?: Registry<Transition>;

  /** Whether or not to use transitions as elements are added and removed from the DOM. */
  transitionsEnabled?: boolean;

  /** Whether or not to use twoway bindings by default. */
  twoway?: boolean;

  /** Whether or not to issue a warning when an ambiguous reference fails to resolve to the immediate context. */
  warnAboutAmbiguity?: boolean;
}

export interface ExtendOpts<T extends Ractive<T> = Ractive> extends BaseInitOpts<T> {
  /** A list of attributes to be reserved by a component. Any additional attributes are collected into the extra-attributes partial. */
  attributes?: string[] | { optional?: string[]; required?: string[] };

  /** The css to add to the page when the first instance of this component is rendered. */
  css?: string | CssFn;

  /** Default data to be supplied to any css functions. */
  cssData?: ValueMap;

  /** The id to use when transforming css to be scoped. Defaults to a random guid. */
  cssId?: string;

  /** A function supplying the default data for instances of this component. */
  data?: DataFn<T>;

  /** Whether or not data and plugins can be pulled from parent instances. Defaults to false. */
  isolated?: boolean;

  /** If true, css selectors will not be scoped using the cssId of this component. */
  noCssTransform?: boolean;
  noCSSTransform?: boolean;

  /** An array of plugins to apply to the component. */
  use?: PluginExtend[];
}

export interface InitOpts<T extends Ractive<T> = Ractive> extends BaseInitOpts<T> {
  /** Initial data for this instance. */
  data?: Data | DataFn<T>;

  /** The target element into which to render this instance. */
  el?: Target;

  /** The target element into which to render this instance. */
  target?: Target;

  /** An array of plugins to apply to the instance. */
  use?: PluginInstance[];

  /** If true, this instance can occupy the target element with other existing instances rather than cause them to unrender. Cannot be used with enhance. */
  append?: true;

  /** If true, this instance will try to reuse DOM nodes found in its target rather than discarding and replacing them. Cannot be used with append. */
  enhance?: true;

  component?: unknown;

  /**
   * A lifecycle event that is called when an instance is constructed but before any initialization option has been processed.
   * Accepts the instance's initialization options as argument.
   */
  onconstruct?(this: T, opts: InitOpts): void;

  /** A lifecycle event that is called when an instance is constructed and is ready to be rendered. */
  oninit?(this: T): void;

  /** A lifecycle event that is called when an instance is constructed and all initialization options have been processed. */
  onconfig?(this: T): void;

  /** A lifecycle event that is called when the instance is rendered but before transitions start. */
  onrender?(this: T): void;

  /** A lifecycle event that is called when the instance is rendered and all the transitions have completed. */
  oncomplete?(this: T): void;

  /** A lifecycle event that is called when ractive.insert() is called. */
  oninsert?(this: T): void;

  /**
   * A lifecycle event that is called whenever `ractive.detach()` is called.
   * Note that `ractive.insert()` implicitly calls `ractive.detach()` if needed.
   */
  ondetach?(this: T): void;

  /** A lifecycle event that is called when ractive.update() is called. */
  onupdate?(this: T): void;

  /** A lifecycle event that is called when an instance is constructed and is ready to be rendered. */
  onunrender?(this: T): void;

  /** A lifecycle event that is called when an instance is constructed and is ready to be rendered. */
  onteardown?(this: T): void;
}
