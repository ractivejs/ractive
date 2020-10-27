import type { Ractive, Static } from 'src/Ractive/RactiveDefinition';
import type { ComputationDescriptor, InternalComputationDescription } from 'types/Computation';
import type { Keypath } from 'types/Generic';
import bind from 'utils/bind';
import { isFunction, isString, isObjectType } from 'utils/is';
import { fatal } from 'utils/log';

import { createFunctionFromString } from '../config/runtime-parser';

export interface ComputationSignature<T = unknown> {
  getter: (this: Ractive, context: Ractive | Static, keypath: Keypath) => T;
  setter: (value: T, context: Ractive | Static, keypath: Keypath) => void;
  getterString: string;
  setterString: string;
  getterUseStack: boolean;
}

export default function getComputationSignature(
  ractive: Ractive,
  key: string,
  signature: InternalComputationDescription
): ComputationSignature {
  let getter;
  let setter;

  // useful for debugging
  let getterString: string;
  let getterUseStack: boolean;
  let setterString: string;

  if (isFunction(signature)) {
    getter = bind(signature, ractive);
    getterString = signature.toString();
    getterUseStack = true;
  }

  if (isString(signature)) {
    getter = createFunctionFromString(signature, ractive);
    getterString = signature;
  }

  if (isObjectType<ComputationDescriptor>(signature)) {
    if (isString(signature.get)) {
      getter = createFunctionFromString(signature.get, ractive);
      getterString = signature.get;
    } else if (isFunction(signature.get)) {
      getter = bind(signature.get, ractive);
      getterString = signature.get.toString();
      getterUseStack = true;
    } else {
      fatal('`%s` computation must have a `get()` method', key);
    }

    if (isFunction(signature.set)) {
      setter = bind(signature.set, ractive);
      setterString = signature.set.toString();
    }
  }

  return {
    getter,
    setter,
    getterString,
    setterString,
    getterUseStack
  };
}
