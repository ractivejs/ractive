import { interpolate } from 'shared/interpolate';
import { isArray, isObject, isNumeric } from 'utils/is';
import { hasOwn } from 'utils/object';

export type InterpolatorFunction<T = unknown> = (from: T, to: T) => (t: number) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const interpolators: Record<string, InterpolatorFunction<any>> = {
  number(from: number, to: number) {
    if (!isNumeric(from) || !isNumeric(to)) {
      return null;
    }

    from = +from;
    to = +to;

    const delta = to - from;

    if (!delta) {
      return function () {
        return from;
      };
    }

    return function (t) {
      return from + t * delta;
    };
  },

  array<T>(from: T[], to: T[]) {
    if (!isArray(from) || !isArray(to)) {
      return null;
    }

    let len: number, i: number;

    const intermediate = [];
    const interpolators = [];

    i = len = Math.min(from.length, to.length);
    while (i--) {
      interpolators[i] = interpolate(from[i], to[i]);
    }

    // surplus values - don't interpolate, but don't exclude them either
    for (i = len; i < from.length; i += 1) {
      intermediate[i] = from[i];
    }

    for (i = len; i < to.length; i += 1) {
      intermediate[i] = to[i];
    }

    return function (t) {
      let i = len;

      while (i--) {
        intermediate[i] = interpolators[i](t);
      }

      return intermediate;
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object<T extends Record<string, any>>(from: T, to: T) {
    if (!isObject(from) || !isObject(to)) {
      return null;
    }

    const properties = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intermediate: Record<string, any> = {};
    const interpolators: Record<string, ReturnType<InterpolatorFunction<T>>> = {};

    for (const prop in from) {
      if (hasOwn(from, prop)) {
        if (hasOwn(to, prop)) {
          properties.push(prop);
          interpolators[prop] = interpolate(from[prop], to[prop]) || (() => to[prop]);
        } else {
          intermediate[prop] = from[prop];
        }
      }
    }

    for (const prop in to) {
      if (hasOwn(to, prop) && !hasOwn(from, prop)) {
        intermediate[prop] = to[prop];
      }
    }

    const len = properties.length;

    return function (t) {
      let i = len;

      while (i--) {
        const prop = properties[i];

        intermediate[prop] = interpolators[prop](t);
      }

      return intermediate;
    };
  }
};

export default interpolators;
