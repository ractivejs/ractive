import bind from 'utils/bind';
import { isFunction, isString, isObjectType } from 'utils/is';
import { fatal } from 'utils/log';

import { createFunctionFromString } from '../config/runtime-parser';

export default function getComputationSignature(ractive, key, signature) {
  let getter;
  let setter;

  // useful for debugging
  let getterString;
  let getterUseStack;
  let setterString;

  if (isFunction(signature)) {
    getter = bind(signature, ractive);
    getterString = signature.toString();
    getterUseStack = true;
  }

  if (isString(signature)) {
    getter = createFunctionFromString(signature, ractive);
    getterString = signature;
  }

  if (isObjectType(signature)) {
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
