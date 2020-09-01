import { ValueMap } from 'types/Generic';

const obj = Object;

// TODO might worth to convert into a class with only static methods?

export const assign = obj.assign;

export const create = obj.create;

export const defineProperty = obj.defineProperty;

export const defineProperties = obj.defineProperties;

export const keys = obj.keys;

export function hasOwn(obj: Record<string, unknown>, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function fillGaps(target: ValueMap, ...sources: ValueMap[]): ValueMap {
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

export function toPairs(obj: ValueMap = {}): ValueMap[] {
  const pairs = [];
  for (const key in obj) {
    // Source can be a prototype-less object.
    if (!hasOwn(obj, key)) continue;
    pairs.push([key, obj[key]]);
  }
  return pairs;
}
