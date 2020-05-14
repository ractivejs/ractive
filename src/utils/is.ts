const toString = Object.prototype.toString;

/* Basic */

export function isString(thing: unknown): thing is string {
  return typeof thing === 'string';
}

export function isUndefined(thing: unknown): thing is undefined {
  return thing === undefined;
}

export function isFunction(thing: unknown): thing is Function {
  return typeof thing === 'function';
}

export function isNumber(thing: unknown): thing is number {
  return typeof thing === 'number';
}

/**
 * @see http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
 */
export function isNumeric(thing: string | number): boolean {
  return !isNaN(parseFloat(thing as string)) && isFinite(thing as number);
}

/* Object */

export function isObject(thing: unknown): boolean {
  return thing && toString.call(thing) === '[object Object]';
}

export function isObjectType(thing: unknown): thing is object {
  return typeof thing === 'object';
}

export function isObjectLike(thing: unknown): boolean {
  return !!(thing && (isObjectType(thing) || isFunction(thing)));
}

/* Array */

export const isArray = Array.isArray;

const arrayLikePattern = /^\[object (?:Array|FileList)\]$/;
export function isArrayLike(obj: unknown): boolean {
  return arrayLikePattern.test(toString.call(obj));
}

/* Misc */

export function isEqual(a: object, b: object): boolean {
  if (a === null && b === null) {
    return true;
  }

  if (isObjectType(a) || isObjectType(b)) {
    return false;
  }

  return a === b;
}
