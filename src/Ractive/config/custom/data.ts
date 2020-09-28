import type { Ractive, Static } from 'src/Ractive/RactiveDefinition';
import type { Data, DataFn } from 'types/Generic';
import type { ExtendOpts, InitOpts } from 'types/InitOptions';
import bind from 'utils/bind';
import { isArray, isObject, isFunction, isObjectType } from 'utils/is';
import { fatal, warnIfDebug, warnOnceIfDebug } from 'utils/log';

interface DataConfigurator {
  name: 'data';
  extend: (parent: typeof Static, proto: Ractive, options: ExtendOpts) => void;
  init: (parent: Ractive['constructor'], proto: Ractive, options: InitOpts) => Data;
  // Read comment in function implementation
  // reset: (ractive: Ractive) => void;
}

const dataConfigurator: DataConfigurator = {
  name: 'data',

  extend: (_Parent, proto, options): void => {
    let key: string | number;
    let value: unknown;

    // check for non-primitives, which could cause mutation-related bugs
    if (isObject(options?.data)) {
      for (key in options.data) {
        value = options.data[key];

        if (value && isObjectType(value)) {
          if (isObject(value) || isArray(value)) {
            warnIfDebug(`Passing a \`data\` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:

  // this...
  data: function () {
    return {
      myObject: {}
    };
  })

  // instead of this:
  data: {
    myObject: {}
  }`);
          }
        }
      }
    }

    proto.data = combine(proto.data, options.data);
  },

  init: (Parent, ractive, options) => {
    let result = combine(Parent.prototype.data, options.data);

    if (isFunction(result)) result = result.call(ractive);

    // bind functions to the ractive instance at the top level,
    // unless it's a non-POJO (in which case alarm bells should ring)
    if (result && result.constructor === Object) {
      for (const prop in result) {
        if (isFunction(result[prop])) {
          const value = result[prop];
          result[prop] = bind(value, ractive);
          result[prop]._r_unbound = value;
        }
      }
    }

    return result || {};
  }

  // TSRChange - it's seems that this method is not used
  // reset(this: DataManager, ractive): true {
  //   const result = this.init(ractive.constructor, ractive, ractive.viewmodel);
  //   ractive.viewmodel.root.set(result);
  //   return true;
  // }
};

export default dataConfigurator;

function emptyData(): Record<string, unknown> {
  return {};
}

function validate(data: unknown): void {
  // Warn if userOptions.data is a non-POJO
  if (data && data.constructor !== Object) {
    if (isFunction(data)) {
      // TODO do we need to support this in the new Ractive() case?
    } else if (!isObjectType(data)) {
      fatal(`data option must be an object or a function, \`${data}\` is not valid`);
    } else {
      warnIfDebug(
        'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged'
      );
    }
  }
}

function combine(parentValue: Data | DataFn, childValue: Data | DataFn): Data {
  validate(childValue);

  // Very important, otherwise child instance can become
  // the default data object on Ractive or a component.
  // then ractive.set() ends up setting on the prototype!
  if (!childValue && !isFunction(parentValue)) {
    // this needs to be a function so that it can still inherit parent defaults
    childValue = emptyData;
  }

  // Fast path, where we just need to copy properties from
  // parent to child
  if (!isFunction(childValue) && !isFunction(parentValue)) {
    return fromProperties(childValue, parentValue);
  }

  return function () {
    const child = isFunction(childValue) ? callDataFunction(childValue, this) : childValue;
    const parent = isFunction(parentValue) ? callDataFunction(parentValue, this) : parentValue;

    return fromProperties(child, parent);
  };
}

function callDataFunction(fn: DataFn, context: Ractive): Data {
  const data = fn.call(context);

  if (!data) return;

  if (!isObjectType(data)) {
    fatal('Data function must return an object');
  }

  if (data.constructor !== Object) {
    warnOnceIfDebug(
      'Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged'
    );
  }

  return data;
}

function fromProperties(
  primary: Record<string, unknown>,
  secondary: Record<string, unknown>
): Record<string, unknown> {
  if (primary && secondary) {
    for (const key in secondary) {
      if (!(key in primary)) {
        primary[key] = secondary[key];
      }
    }

    return primary;
  }

  return primary || secondary;
}
