export function hasOwn(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function fillGaps(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    for (const key in source) {
      // Source can be a prototype-less object.
      if (key in target || !hasOwn(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

export function toPairs(obj = {}) {
  const pairs = [];
  for (const key in obj) {
    // Source can be a prototype-less object.
    if (!hasOwn(obj, key)) continue;
    pairs.push([key, obj[key]]);
  }
  return pairs;
}

const obj = Object;

export const assign = obj.assign;

export const create = obj.create;

export const defineProperty = obj.defineProperty;

export const defineProperties = obj.defineProperties;

export const keys = obj.keys;
