import { splitKeypath } from 'shared/keypaths';
import { Keypath } from 'types/Generic';
import {
  ObserverCallback,
  ObserverOpts,
  ObserverHandle,
  ObserverArrayOpts,
  ObserverArrayCallback
} from 'types/Observer';
import { isFunction, isObjectType } from 'utils/is';
import { warnOnceIfDebug } from 'utils/log';
import { keys } from 'utils/object';
import resolveReference from 'view/resolvers/resolveReference';

import { Ractive } from '../RactiveDefinition';

import ArrayObserver from './observe/Array';
import Observer from './observe/Observer';
import PatternObserver from './observe/Pattern';

export type ObserverCallbackMap<
  T extends ObserverCallback | ObserverArrayCallback = ObserverCallback
> = Record<Keypath, T>;
export type InternalObserver = ArrayObserver | Observer | PatternObserver;

/**
 * Observes the data at a particular keypath.
 * Unless specified otherwise, the callback will be fired immediately,
 * with `undefined` as `oldValue`. Thereafter it will be called whenever the observed keypath changes.
 *
 * @example ractive.observe(keypath, callback[, options])
 * @example ractive.observe(map[, options])
 *
 * @param keypath The keypath to observe, or a group of space-separated keypaths.
 *                Any of the keys can be a `*` character, which is treated as a wildcard. A `**` means recursive.
 *                The difference between `*` and `**` is that `*` provides your callback function value and keypath
 *                arguments containing the path of the what actually changed, at any level of the keypath.
 *                So instead of getting the same parent value on every change, you get the changed value from whatever arbitrarily
 *                deep keypath changed.
 *
 * @param callback The function that will be called, with `newValue`, `oldValue` and keypath as arguments
 *                 (see Observers for more nuance regarding these arguments), whenever the observed keypath changes value.
 *                 By default the function will be called with ractive as this. Any wildcards in the keypath will have their
 *                 matches passed to the callback at the end of the arguments list as well.
 *
 * @param options
 */
function Ractive$observe(
  keypath: Keypath,
  callback: ObserverCallback,
  opts?: ObserverOpts
): ObserverHandle;
function Ractive$observe(
  keypath: Keypath,
  callback: ObserverArrayCallback,
  opts?: ObserverArrayOpts
): ObserverHandle;
function Ractive$observe(map: ObserverCallbackMap, opts?: ObserverOpts): ObserverHandle;
function Ractive$observe(
  map: ObserverCallbackMap<ObserverArrayCallback>,
  opts?: ObserverArrayOpts
): ObserverHandle;

function Ractive$observe(
  this: Ractive,
  keypath:
    | Keypath
    | ObserverCallbackMap
    | ObserverCallbackMap<ObserverArrayCallback>
    | ObserverCallback
    | ObserverArrayCallback,
  callback?: ObserverCallback | ObserverArrayCallback | ObserverOpts | ObserverArrayOpts,
  options?: ObserverOpts | ObserverArrayOpts
): ObserverHandle {
  const observers: InternalObserver[] = [];
  let map: ObserverCallbackMap;
  let opts: ObserverOpts | ObserverArrayOpts;

  if (isObjectType<ObserverCallbackMap>(keypath)) {
    map = keypath;
    opts = (callback as ObserverOpts) || {};
  } else if (isFunction(keypath)) {
    map = { '': keypath };
    opts = (callback as ObserverOpts) || {};
  } else if (isFunction(callback)) {
    map = {};
    map[keypath] = callback;
    opts = options || {};
  }

  let silent = false;
  keys(map).forEach(keypath => {
    const callback = map[keypath];
    const caller = function(...args): ReturnType<ObserverCallback> {
      if (silent) return;
      return callback.apply(this, args);
    };

    let keypaths = keypath.split(' ');
    if (keypaths.length > 1) keypaths = keypaths.filter(k => k);

    keypaths.forEach(keypath => {
      opts.keypath = keypath;
      const observer = createObserver(this, keypath, caller, opts);
      if (observer) observers.push(observer);
    });
  });

  // add observers to the Ractive instance, so they can be
  // cancelled on ractive.teardown()
  this._observers.push(...observers);

  return {
    cancel: () => observers.forEach(o => o.cancel()),
    isSilenced: () => silent,
    silence: () => (silent = true),
    resume: () => (silent = false)
  };
}

export default Ractive$observe;

function createObserver(
  ractive: Ractive,
  keypath: Keypath,
  callback: ObserverCallback | ObserverArrayCallback,
  options: ObserverOpts | ObserverArrayOpts
): InternalObserver {
  const keys = splitKeypath(keypath);
  let wildcardIndex = keys.indexOf('*');
  if (!~wildcardIndex) wildcardIndex = keys.indexOf('**');

  options.fragment = options.fragment || ractive.fragment;

  let model;
  if (!options.fragment) {
    model = ractive.viewmodel.joinKey(keys[0]);
  } else {
    // .*.whatever relative wildcard is a special case because splitkeypath doesn't handle the leading .
    if (~keys[0].indexOf('.*')) {
      model = options.fragment.findContext();
      wildcardIndex = 0;
      keys[0] = keys[0].slice(1);
    } else {
      model =
        wildcardIndex === 0
          ? options.fragment.findContext()
          : resolveReference(options.fragment, keys[0]);
    }
  }

  // the model may not exist key
  if (!model) model = ractive.viewmodel.joinKey(keys[0]);

  if (!~wildcardIndex) {
    model = model.joinAll(keys.slice(1));
    if ('array' in options && options.array) {
      return new ArrayObserver(ractive, model, callback as ObserverArrayCallback, options);
    } else {
      return new Observer(ractive, model, callback, options);
    }
  } else {
    const double = keys.indexOf('**');
    if (~double) {
      if (double + 1 !== keys.length || ~keys.indexOf('*')) {
        warnOnceIfDebug(
          `Recursive observers may only specify a single '**' at the end of the path.`
        );
        return;
      }
    }

    model = model.joinAll(keys.slice(1, wildcardIndex));

    return new PatternObserver(ractive, model, keys.slice(wildcardIndex), callback, options);
  }
}
