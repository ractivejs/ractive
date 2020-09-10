import Model from 'model/Model';
import { Ractive } from 'src/Ractive/Ractive';
import { Keypath } from 'types/Generic';
import { SetOpts } from 'types/MethodOptions';
import { isArray, isObject, isObjectType, isFunction, isString, isUndefined } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { hasOwn } from 'utils/object';
import resolveReference from 'view/resolvers/resolveReference';

import runloop from '../global/runloop';

import { FakeFragment } from './getRactiveContext';
import { splitKeypath } from './keypaths';

export let keep = false;

type SetPair<M extends Model = Model, V = unknown> = [M, V, Keypath?];
export function set<M extends Model, V>(pairs: [SetPair<M, V>], options?: SetOpts): Promise<V>;
export function set<M extends Model, V>(pairs: SetPair<M, V>[], options?: SetOpts): Promise<void>;
export function set<M extends Model, V>(
  pairs: SetPair<M, V>[],
  options?: SetOpts
): Promise<void | V> {
  const k = keep;

  const deep = options && options.deep;
  const shuffle = options && options.shuffle;
  const promise = runloop.start();
  if (options && 'keep' in options) keep = options.keep;

  let i = pairs.length;
  while (i--) {
    const [model, value, keypath] = pairs[i];

    if (!model) {
      runloop.end();
      throw new Error(`Failed to set invalid keypath '${keypath}'`);
    }

    if (deep) deepSet(model, value);
    else if (shuffle) {
      let array = value;
      const target = model.get();
      // shuffle target array with itself
      if (!array) array = target;

      // if there's not an array there yet, go ahead and set
      if (isUndefined(target)) {
        model.set(array);
      } else {
        if (!isArray(target) || !isArray(array)) {
          runloop.end();
          throw new Error('You cannot merge an array with a non-array');
        }

        const comparator = getComparator(shuffle);
        model.merge(array, comparator);
      }
    } else model.set(value);
  }

  runloop.end();

  keep = k;

  if (pairs.length === 1) {
    return promise.then(() => pairs[0][1]);
  }

  return promise;
}

const star = /\*/;
export function gather(ractive, keypath, base, isolated): any[] {
  if (!base && (keypath[0] === '.' || keypath[1] === '^')) {
    warnIfDebug(
      `Attempted to set a relative keypath from a non-relative context. You can use a context object to set relative keypaths.`
    );
    return [];
  }

  const keys = splitKeypath(keypath);
  const model = base || ractive.viewmodel;

  if (star.test(keypath)) {
    return model.findMatches(keys);
  } else {
    if (model === ractive.viewmodel) {
      // allow implicit mappings
      if (
        ractive.component &&
        !ractive.isolated &&
        !model.has(keys[0]) &&
        keypath[0] !== '@' &&
        keypath[0] &&
        !isolated
      ) {
        return [resolveReference(ractive.fragment || new FakeFragment(ractive), keypath)];
      } else {
        return [model.joinAll(keys)];
      }
    } else {
      return [model.joinAll(keys)];
    }
  }
}

export function build(
  ractive: Ractive,
  keypath: Keypath,
  value: unknown,
  isolated: boolean
): SetPair[] {
  const sets = [];

  // set multiple keypaths in one go
  if (isObject(keypath)) {
    for (const k in keypath) {
      if (hasOwn(keypath, k)) {
        sets.push(...gather(ractive, k, null, isolated).map(m => [m, keypath[k], k]));
      }
    }
  } else {
    // set a single keypath
    sets.push(...gather(ractive, keypath, null, isolated).map(m => [m, value, keypath]));
  }

  return sets;
}

const deepOpts = { virtual: false };
function deepSet(model, value) {
  const dest = model.get(false, deepOpts);

  // if dest doesn't exist, just set it
  if (dest == null || !isObjectType<Record<string, unknown>>(value)) return model.set(value);
  if (!isObjectType(dest)) return model.set(value);

  for (const k in value) {
    if (hasOwn(value, k)) {
      deepSet(model.joinKey(k), value[k]);
    }
  }
}

const comparators = {};
function getComparator(option) {
  if (option === true) return null; // use existing arrays
  if (isFunction(option)) return option;

  if (isString(option)) {
    return comparators[option] || (comparators[option] = thing => thing[option]);
  }

  throw new Error('If supplied, options.compare must be a string, function, or true'); // TODO link to docs
}
