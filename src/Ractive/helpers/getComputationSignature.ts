import { Computation as ComputationType, ComputationDescriptor } from 'types/Computation';
import { Keypath } from 'types/Keypath';
import bind from 'utils/bind';
import { isFunction, isString, isObjectType } from 'utils/is';
import { fatal } from 'utils/log';

import { createFunctionFromString } from '../config/runtime-parser';

export interface ComputationSignature {
  // TODO add ractive type on this param
  getter: (this: any, context: any, keypath: Keypath) => any;
  setter: (value: any, context: any, keypath: Keypath) => void;
  getterString: string;
  setterString: string;
  getterUseStack: boolean;
}

export default function getComputationSignature(
  ractive, // TODO add ractive type
  key: string,
  signature: ComputationType<any> // TODO add ractive type
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

  // TODO add ractive type
  if (isObjectType<ComputationDescriptor<any>>(signature)) {
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
