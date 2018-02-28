const toString = Object.prototype.toString;
const arrayLikePattern = /^\[object (?:Array|FileList)\]$/;

export function isArrayLike(obj) {
  return arrayLikePattern.test(toString.call(obj));
}

export const isArray = Array.isArray;

export function isEqual(a, b) {
  if (a === null && b === null) {
    return true;
  }

  if (isObjectType(a) || isObjectType(b)) {
    return false;
  }

  return a === b;
}

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
export function isNumeric(thing) {
  return !isNaN(parseFloat(thing)) && isFinite(thing);
}

export function isObject(thing) {
  return thing && toString.call(thing) === "[object Object]";
}

export function isObjectLike(thing) {
  return !!(thing && (isObjectType(thing) || isFunction(thing)));
}

export function isObjectType(thing) {
  return typeof thing === "object";
}

export function isFunction(thing) {
  return typeof thing === "function";
}

export function isString(thing) {
  return typeof thing === "string";
}

export function isNumber(thing) {
  return typeof thing === "number";
}
