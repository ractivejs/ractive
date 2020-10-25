import { isArray, isString, isUndefined } from './is';

export function addToArray<T>(array: T[], value: T): void {
  const index = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  }
}

export function arrayContains<T>(array: T[], value: T): boolean {
  const valueIndex = array.indexOf(value);
  return valueIndex !== -1;
}

export function arrayContentsMatch<T>(a: T[], b: T[]): boolean {
  if (!isArray(a) || !isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let i = a.length;
  while (i--) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function ensureArray(x: string): [string];
export function ensureArray(x: undefined): [];
export function ensureArray<T extends Array<unknown>>(x: T): T;

export function ensureArray(x: unknown): unknown {
  if (isString(x)) {
    return [x];
  }

  if (isUndefined(x)) {
    return [];
  }

  return x;
}

export function lastItem<T>(array: T[]): T {
  return array[array.length - 1];
}

export function removeFromArray<T>(array: T[], member: T): void {
  if (!array) {
    return;
  }

  const index = array.indexOf(member);

  if (index !== -1) {
    array.splice(index, 1);
  }
}

export function combine<T>(...arrays: (T | T[])[]): T[] {
  const res = arrays.concat.apply([], arrays);
  let i = res.length;
  while (i--) {
    const idx = res.indexOf(res[i]);
    if (~idx && idx < i) res.splice(i, 1);
  }

  return res;
}

export function toArray<T>(arrayLike: ArrayLike<T>): T[] {
  const array = [];
  let i = arrayLike.length;
  while (i--) {
    array[i] = arrayLike[i];
  }

  return array;
}

export function findMap<T, X>(array: T[], fn: (item: T) => X): X {
  const len = array.length;
  for (let i = 0; i < len; i++) {
    const result = fn(array[i]);
    if (result) return result;
  }
}

export interface Indexes extends Array<number | string> {
  oldLen?: number;
  newLen?: number;
  same?: boolean;
}

export function buildNewIndices<T>(one: T[], two: T[]): Indexes;
export function buildNewIndices<T, X>(one: T[], two: T[], mapper: (item: T) => X): Indexes;

export function buildNewIndices<T, X>(one: T[], two: T[], mapper?: (item: T) => X): Indexes {
  let oldArray: unknown[] = one;
  let newArray: unknown[] = two;
  if (mapper) {
    oldArray = oldArray.map(mapper);
    newArray = newArray.map(mapper);
  }

  const oldLength = oldArray.length;

  const usedIndices: { [key: string]: boolean } = {};
  let firstUnusedIndex = 0;

  const result: Indexes = oldArray.map(item => {
    let index: number;
    let start = firstUnusedIndex;

    do {
      index = newArray.indexOf(item, start);

      if (index === -1) {
        return -1;
      }

      start = index + 1;
    } while (usedIndices[index] === true && start < oldLength);

    // keep track of the first unused index, so we don't search
    // the whole of newArray for each item in oldArray unnecessarily
    if (index === firstUnusedIndex) {
      firstUnusedIndex += 1;
    }
    // allow next instance of next "equal" to be found item
    usedIndices[index] = true;
    return index;
  });

  const len = (result.oldLen = oldArray.length);
  result.newLen = newArray.length;

  if (len === result.newLen) {
    let i = 0;
    for (i; i < len; i++) {
      if (result[i] !== i) break;
    }

    if (i === len) result.same = true;
  }

  return result;
}
