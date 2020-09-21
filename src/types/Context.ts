import { AnimatePromise } from 'model/Model';
import { AnimateOpts } from 'src/Ractive/prototype/animate';
import { Ractive } from 'src/Ractive/RactiveDefinition';

import { DecoratorHandle } from './Decorator';
import { ArrayPopPromise, ArrayPushPromise, ArraySplicePromise, ValueMap } from './Generic';
import { ListenerHandle } from './Listener';
import {
  GetOpts,
  LinkOpts,
  ReadLinkOpts,
  ReadLinkResult,
  SetOpts,
  UpdateOpts
} from './MethodOptions';
import {
  ObserverCallback,
  ObserverOpts,
  ObserverHandle,
  ObserverArrayCallback,
  ObserverArrayOpts
} from './Observer';
import { Registry } from './Registries';

export interface ContextHelper {
  /** The Ractive instance associated with this Context. */
  ractive: Ractive;
  /** A map of currently attached decorator handles, by name, that are associated with the element, if any, that this Context is associated with. */
  decorators: Registry<DecoratorHandle>;
  /** The element associated with this Context, if any. */
  node?: HTMLElement;
  /** The event associated with this Context, if any. */
  original?: Event;
  /** The event associated with this Context, if any. */
  event?: Event;
  /** The source component for a bubbled event Context, if any. */
  component?: Ractive;

  /** Add to the number at the given keypath
   * @param keypath a Context-relative keypath to a number
   * @param amount the amount to add to the target number - defaults to 1
   */
  add(keypath: string, amount?: number): Promise<void>;

  /**
   * Animate the value at the given keypath from its current value to the given value.
   * @param keypath a Context-relative keypath to the value
   * @param value the target value
   * @param opts
   */
  animate(keypath: string, value: any, opts?: AnimateOpts): AnimatePromise;

  /**
   * Retrieve the value associated with the current Context.
   * @param opts
   */
  get(opts?: GetOpts): any;

  /**
   * Retrieve the value at the given keypath.
   * @param keypath a Context-relative keypath to the value
   * @param opts
   */
  get(keypath: string, opts?: GetOpts): any;

  /**
   * Retrieve the value associated with the twoway binding of the element e.g. .value in <input value="{{.value}}" />.
   */
  getBinding(): any;

  /**
   * Resolve the keypath associated with the twoway binding of the element e.g. '.value' in <input value="{{.value}}" />.
   * @param ractive the instance against which to resolve the path
   */
  getBindingPath(ractive?: Ractive): string;

  /**
   * Retrieve the Context that is the parent of this one e.g. for {{#with foo}} from the <div> in {{#with foo}}{{#with bar}}<div />{{/with}}{{/with}}.
   * @param crossComponentBoundary whether or not to cross a component boundary when getting the parent context
   */
  getParent(crossComponentBoundary?: boolean): this;

  /**
   * Determine whether or not the element associated with the Context as a Ractive listener (on-event) for the given event.
   * @param event the event for which to check
   * @param bubble whether or not check parent elements for a listener if the current element does not have one - defaults to false
   */
  hasListener(event: string, bubble?: boolean): boolean;

  /**
   * Determine whether or not there is a twoway binding associated with the element associated with this Context.
   */
  isBound(): boolean;

  /**
   * Create a link to the given source keypath at the given target keypath, similar to a symlink in filesystems. This allows safely referencing the same data at two places in the same instance or across instances if given a target instance. Cross-instance links are also known as mappings.
   * @param source the Context-relative keypath to the source of the link
   * @param dest the Context-relative keypath for the destination
   * @param opts
   */
  link(source: string, dest: string, opts?: LinkOpts): Promise<void>;

  /**
   * Attach a delegation-aware DOM event listener to the element associated with this Context.
   * @param event the name of DOM event for which to listen
   * @param callback the callback to call when the given event is fired
   */
  listen(event: string, callback: (this: HTMLElement, event: Event) => void): ListenerHandle;

  /**
   * Create an observer at the given keypath that will be called when the value at that Context-relative keypath mutates.
   * @param keypath the keypath(s) to observe - multiple keypaths can be separated by a space
   * @param callback
   * @param opts
   */
  observe(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;

  /**
   * Create an observer at the given keypath that will be called when the value at that Context-relative keypath mutates.
   * @param keypath the keypath(s) to observe - multiple keypaths can be separated by a space
   * @param callback
   * @param opts
   */
  observe(
    keypath: string,
    callback: ObserverArrayCallback,
    opts?: ObserverArrayOpts
  ): ObserverHandle;

  /**
   * Create a set of observers from the given map.
   * @param map Context-relative keypath -> callback pairs to observe
   * @returns an observer handle that controls all of the created observers
   */
  observe(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;

  /**
   * Create a set of observers from the given map.
   * @param map Context-relative keypath -> callback pairs to observe
   * @returns an observer handle that controls all of the created observers
   */
  observe(map: { [key: string]: ObserverArrayCallback }, opts?: ObserverArrayOpts): ObserverHandle;

  /**
   * Create an observer at the given keypath that will be called the first time the value at that Context-relative keypath mutates. After that call, the observer will be automatically cancelled.
   * @param keypath the keypath(s) to observer - multiple keypaths can be separated by a space
   * @param callback
   * @param opts
   */
  observeOnce(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;

  /**
   * Create an observer at the given keypath that will be called the first time the value at that Context-relative keypath mutates. After that call, the observer will be automatically cancelled.
   * @param keypath the keypath(s) to observer - multiple keypaths can be separated by a space
   * @param callback
   * @param opts
   */
  observeOnce(
    keypath: string,
    callback: ObserverArrayCallback,
    opts?: ObserverArrayOpts
  ): ObserverHandle;

  /**
   * Create a set of observers from the given map. After the first observed value from any of the set mutates, all of the observers will be cancelled.
   * @param map Context-relative keypath -> callback pairs to observe
   * @returns an observer handle that controls all of the created observersj
   */
  observeOnce(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;

  /**
   * Create a set of observers from the given map. After the first observed value from any of the set mutates, all of the observers will be cancelled.
   * @param map Context-relative keypath -> callback pairs to observe
   * @returns an observer handle that controls all of the created observersj
   */
  observeOnce(
    map: { [key: string]: ObserverArrayCallback },
    opts?: ObserverArrayOpts
  ): ObserverHandle;

  /**
   * Pop a value off the array at the given Context-relative keypath.
   * @param keypath keypath to the target array
   */
  pop(keypath: string): ArrayPopPromise;

  /**
   * Push a value onto the array at the given Context-relative keypath. If there is no value (undefined) at the given keypath, an array will be created for it.
   * @param keypath keypath to the target array
   * @param values
   */
  push(keypath: string, ...values: any[]): ArrayPushPromise;

  /**
   * Manually call a Ractive event handler on the element associated with this Context e.g. to trigger the 'event' handler <div on-event="..." />, use context.raise('event');
   * @param event the name of the event to trigger
   * @param context the optional context to supply to the event handler
   * @param args any additional args to supply to the event handler
   */
  raise(event: string, context?: ContextHelper | Record<string, unknown>, ...args: any[]): void;

  /**
   * Get the source keypath for the given Context-relative keypath if it is a link.
   * @param keypath
   * @param opts
   */
  readLink(keypath: string, opts?: ReadLinkOpts): ReadLinkResult;

  /**
   * Resolve the given Context-relative keypath to a root keypath, optionally in the given instance. Note that some keypaths cannot be resolved to root keypaths.
   * @param keypath @default '.' relative keypath
   * @param ractive target instance in which to resolve the keypath
   */
  resolve(keypath?: string, ractive?: Ractive): string;

  /**
   * Reverse the array at the given Context-relative keypath.
   * @param keypath keypath to the targret array
   */
  reverse(keypath: string): ArraySplicePromise;

  /**
   * Set a value at the given Context-relative keypath. If any intermediate levels do not exist in the data, they will be created as appriate - objects for string keys and arrays for numeric keys.
   * @param keypath
   * @param value the value to set
   * @param opts
   */
  set(keypath: string, value: any, opts?: SetOpts): Promise<void>;

  /**
   * Set a set of values from the given map. All of the values will be set before any DOM changes are propagated, but the values will still be set in object order in the data, which can cause multiple invalidations on observers, bindings, and template nodes.j
   * @param map Context-relative keypath -> value pairs to be set
   */
  set(map: ValueMap, opts?: SetOpts): Promise<void>;

  /**
   * Set the value associated with any twoway binding associated with this Context e.g. .value in <input value="{{.value}}" />.
   * @param value the target value
   */
  setBinding(value: any): Promise<void>;

  /**
   * Shift a value off of the array at the given Context-relative keypath.
   * @param keypath
   */
  shift(keypath: string): ArrayPopPromise;

  /**
   * Sort the array at the given Context-relative keypath.
   * @param keypath
   */
  sort(keypath: string): ArraySplicePromise;

  /**
   * Splice the array at the given Context-relative keypath.
   * @param keypath
   * @param index index at which to start splicing
   * @param drop number of items to drop starting at the given index
   * @param add items to add at the given index
   */
  splice(keypath: string, index: number, drop: number, ...add: any[]): ArraySplicePromise;

  /**
   * Subtract an amount from the number at the given Context-relative keypath.
   * @param keypath
   * @param amount the amount to subtrat from the value - defaults to 1
   */
  subtract(keypath: string, amount?: number): Promise<void>;

  /**
   * Toggle the value at the given Context-relative keypath. If it is truthy, set it to false, otherwise, set it to true.
   * @param keypath
   */
  toggle(keypath: string): Promise<boolean>;

  /**
   * Remove the link at the given Context-relative keypath.
   * @param keypath
   */
  unlink(keypath: string): Promise<void>;

  /**
   * Remove a DOM listener in a delegation-aware way.
   * @param event name of the event for which to stop listening
   * @param callback the callback listener to remove
   */
  unlisten(event: string, callback: (this: HTMLElement, event: Event) => void): void;

  /**
   * Invalidate the model associated with the current Context. This will cause Ractive to check for any changes that may have happened directly to the data without going through a set or array method.
   * @param opts
   */
  update(opts?: UpdateOpts): Promise<void>;

  /**
   * Invalidate the model at the given Context-relative keypath. This will cause Ractive to check for any changes that may have happened directly to the data without going through a set or array method.
   * @param keypath
   * @param opts
   */
  update(keypath: string, opts?: UpdateOpts): Promise<void>;

  /**
   * Cause any bindings associated with this Context to apply the value in the view to the model. Use this to pull changes made directly to view elements into the data.
   * @param cascade whether or not to cause downstream models to also update
   */
  updateModel(cascade?: boolean): Promise<void>;

  /**
   * Cause any bindings associated with the given Context-relative keypath to apply the value in the view to the model. Use this to pull changes made directly to view elements into the data.
   * @param keypath
   * @param cascade whether or not to cause downstream models to also update
   */
  updateModel(keypath: string, cascade?: boolean): Promise<void>;

  /**
   * Unshift the given value onto the array at the given Context-relative keypath. If there is nothing at the given keypath (undefined), then an array will ne created.
   * @param keypath
   * @param value
   */
  unshift(keypath: string, value: any): ArrayPushPromise;
}
