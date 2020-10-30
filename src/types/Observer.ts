import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type Fragment from 'view/Fragment';

import type { Keypath } from './Generic';

export interface ArrayChanges {
  /**
   * The starting index for the changes.
   */
  start: number;

  /**
   * A list of any added items.
   */
  inserted: unknown[];

  /**
   * A list of any removed items.
   */
  deleted: unknown[];
}

/**
 * @param value the new value
 * @param old the old value
 * @param keypath the keypath of the observed change
 * @param parts keys for any wildcards in the observer
 */
export type ObserverCallback<T extends Ractive = Ractive> = (
  this: T,
  value: any,
  old: any,
  keypath: string,
  ...parts: string[]
) => void | Promise<any>;
export type ObserverArrayCallback<T extends Ractive = Ractive> = (
  this: T,
  changes: ArrayChanges
) => void | Promise<any>;

export interface ObserverBaseOpts {
  /**
   * The context to be used for the callback.
   */
  context?: unknown;

  /**
   * Whether or not to defer calling the callback until after the DOM has been updated.
   */
  defer?: boolean;

  /**
   * Whether or not to call the callback with the initial value.
   */
  init?: boolean;

  /** @internal */
  keypath?: Keypath;

  /** @internal */
  fragment?: Fragment;

  /**
   * @internal
   */
  once?: boolean;
}

export interface ObserverOpts extends ObserverBaseOpts {
  /**
   * Whether or not to follow any links when observing.
   */
  links?: boolean;

  /**
   * The function called to get an old value for the observer. This can be used to do things like freeze the initial value as the old value for all future callbacks.
   */
  old?: ObserverCallback;

  /**
   * Whether or not to use strict equality when checking to see if a value has changed. Defaults to false.
   */
  strict?: boolean;
}

export interface ObserverArrayOpts extends ObserverBaseOpts {
  /**
   * Create an array observer, which fires array changes objects rather than the usual callback when array modification methods are used.
   */
  array: boolean;
}

export interface ObserverHandle {
  /**
   * Removes the listener or observer.j
   */
  cancel(): void;

  /**
   * Stops further firings of the callback. Any related observers will still stay up-to-date, so the old value will be updated as the data changes.
   */
  silence(): void;

  /**
   * @returns true if the callback is not going to be called
   */
  isSilenced(): boolean;

  /**
   * Resume calling the callback with changes or events.
   */
  resume(): void;
}

export interface ObserverBaseDescriptor<T extends Ractive<T> = Ractive> extends ObserverOpts {
  /**
   * The observer callback.
   */
  handler: ObserverCallback<T>;

  /**
   * Whether or not to use observeOnce when subscribing the observer. Defaults to false.
   */
  once?: boolean;
}
export interface ObserverArrayDescriptor<T extends Ractive<T> = Ractive> extends ObserverArrayOpts {
  /**
   * The observer callback.j
   */
  handler: ObserverArrayCallback<T>;

  /**
   * Whether or not to use observeOnce when subscribing the observer. Defaults to false.
   */
  once?: boolean;
}
export type ObserverDescriptor<T extends Ractive<T> = Ractive> =
  | ObserverBaseDescriptor<T>
  | ObserverArrayDescriptor<T>;
