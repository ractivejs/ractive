import Model from 'model/Model';
import getNewIndices from 'shared/getNewIndices';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import { Ractive } from 'src/Ractive/RactiveDefinition';
import { ArrayPopPromise, ArrayPushPromise, ArraySplicePromise, Keypath } from 'types/Generic';
import { isArray, isUndefined } from 'utils/is';

const arrayProto = Array.prototype;

type PathFunction<ReturnType = Promise<void>> = (
  keypath: Keypath,
  ...args: unknown[]
) => ReturnType;
type ModelFunction<ReturnType = Promise<void>> = (mdl: Model, args: unknown[]) => ReturnType;

function makeArrayMethod(
  methodName: 'pop' | 'shift'
): {
  path: PathFunction<ArrayPopPromise>;
  model: ModelFunction<ArrayPopPromise>;
};
function makeArrayMethod(
  methodName: 'push' | 'unshift'
): {
  path: PathFunction<ArrayPushPromise>;
  model: ModelFunction<ArrayPushPromise>;
};
function makeArrayMethod(
  methodName: 'splice' | 'reverse' | 'sort'
): {
  path: PathFunction<ArraySplicePromise>;
  model: ModelFunction<ArraySplicePromise>;
};
function makeArrayMethod(
  methodName: string
): {
  path: PathFunction<Promise<void>>;
  model: ModelFunction<Promise<void>>;
};
function makeArrayMethod(methodName: string): { path: unknown; model: unknown } {
  const path: PathFunction<Promise<unknown>> = function(this: Ractive, keypath, ...args) {
    return model(this.viewmodel.joinAll(splitKeypath(keypath)), args);
  };

  const model: ModelFunction<Promise<unknown>> = function(mdl, args) {
    let array = mdl.get();

    if (!isArray(array)) {
      if (isUndefined(array)) {
        array = [];
        const result = arrayProto[methodName].apply(array, args);
        const promise = runloop.start().then(() => result);
        mdl.set(array);
        runloop.end();
        return promise;
      } else {
        throw new Error(
          `shuffle array method ${methodName} called on non-array at ${mdl.getKeypath()}`
        );
      }
    }

    const newIndices = getNewIndices(array.length, methodName, args);
    const result = arrayProto[methodName].apply(array, args);

    const promise: Promise<unknown> & { result?: unknown } = runloop.start().then(() => result);
    promise.result = result;

    if (newIndices) {
      if (mdl.shuffle) {
        mdl.shuffle(newIndices);
      } else {
        // it's a computation, which don't have a shuffle, so just invalidate
        mdl.mark();
      }
    } else {
      mdl.set(result);
    }

    runloop.end();

    return promise;
  };

  return { path, model };
}

export default makeArrayMethod;
