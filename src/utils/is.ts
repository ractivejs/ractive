const toString = Object.prototype.toString;

/* Basic */

export function isString(thing: unknown): thing is string {
  return typeof thing === 'string';
}

export function isUndefined(thing: unknown): thing is undefined {
  return thing === undefined;
}

export function isFunction<T extends Function = Function>(thing: unknown): thing is T {
  return typeof thing === 'function';
}

export function isNumber(thing: unknown): thing is number {
  return typeof thing === 'number';
}

/**
 * @see http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
 */
export function isNumeric(thing: unknown): thing is number {
  return !isNaN(parseFloat(thing as string)) && isFinite(thing as number);
}

/* Object */

export function isObject(thing: unknown): thing is Record<string, unknown> {
  return thing && toString.call(thing) === '[object Object]';
}

export function isObjectType<T>(thing: unknown): thing is T {
  return typeof thing === 'object';
}

export function isObjectLike(thing: unknown): thing is Function | Record<string, unknown> {
  return !!(thing && (isObjectType(thing) || isFunction(thing)));
}

/* Array */

export const isArray = Array.isArray;

const arrayLikePattern = /^\[object (?:Array|FileList)\]$/;
export function isArrayLike(obj: unknown): boolean {
  return arrayLikePattern.test(toString.call(obj));
}

/* Misc */

export function isEqual(a: unknown, b: unknown): boolean {
  if (a === null && b === null) {
    return true;
  }

  if (isObjectType(a) || isObjectType(b)) {
    return false;
  }

  return a === b;
}
