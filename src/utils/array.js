import { isArray, isString, isUndefined } from './is';

export function addToArray(array, value) {
  const index = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  }
}

export function arrayContains(array, value) {
  for (let i = 0, c = array.length; i < c; i++) {
    if (array[i] == value) {
      return true;
    }
  }

  return false;
}

export function arrayContentsMatch(a, b) {
  let i;

  if (!isArray(a) || !isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  i = a.length;
  while (i--) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function ensureArray(x) {
  if (isString(x)) {
    return [x];
  }

  if (isUndefined(x)) {
    return [];
  }

  return x;
}

export function lastItem(array) {
  return array[array.length - 1];
}

export function removeFromArray(array, member) {
  if (!array) {
    return;
  }

  const index = array.indexOf(member);

  if (index !== -1) {
    array.splice(index, 1);
  }
}

export function combine(...arrays) {
  const res = arrays.concat.apply([], arrays);
  let i = res.length;
  while (i--) {
    const idx = res.indexOf(res[i]);
    if (~idx && idx < i) res.splice(i, 1);
  }

  return res;
}

export function toArray(arrayLike) {
  const array = [];
  let i = arrayLike.length;
  while (i--) {
    array[i] = arrayLike[i];
  }

  return array;
}

export function findMap(array, fn) {
  const len = array.length;
  for (let i = 0; i < len; i++) {
    const result = fn(array[i]);
    if (result) return result;
  }
}

export function buildNewIndices(one, two, comparator) {
  let oldArray = one;
  let newArray = two;
  if (comparator) {
    oldArray = oldArray.map(comparator);
    newArray = newArray.map(comparator);
  }

  const oldLength = oldArray.length;

  const usedIndices = {};
  let firstUnusedIndex = 0;

  const result = oldArray.map(item => {
    let index;
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
