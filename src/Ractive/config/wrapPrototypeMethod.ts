import { isFunction } from 'utils/is';
import noop from 'utils/noop';

import type { Static } from '../RactiveDefinition';

export default function wrap<T extends Function>(
  parent: Static,
  name: string,
  method: T
): Function {
  // TSRChange - add `toString` to method
  if (!/_super/.test(method.toString())) return method;

  function wrapper(...args: unknown[]): unknown {
    const superMethod = getSuperMethod(wrapper._parent, name);
    const hasSuper = '_super' in this;
    const oldSuper = this._super;

    this._super = superMethod;

    const result = method.apply(this, args);

    if (hasSuper) {
      this._super = oldSuper;
    } else {
      delete this._super;
    }

    return result;
  }

  wrapper._parent = parent;
  wrapper._method = method;

  return wrapper;
}

function getSuperMethod(parent: Static, name: string): Function {
  if (name in parent) {
    const value = parent[name];

    return isFunction(value) ? value : () => value;
  }

  return noop;
}
