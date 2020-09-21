import type { Keypath } from 'types/Generic';
import { isString } from 'utils/is';

const refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
const splitPattern = /([^\\](?:\\\\)*)\./;
const escapeKeyPattern = /\\|\./g;
const unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

export function escapeKey(key: string): Keypath {
  if (isString(key)) {
    return key.replace(escapeKeyPattern, '\\$&');
  }

  return key;
}

export function normalise(ref: string): Keypath {
  return ref ? ref.replace(refPattern, '.$1') : '';
}

export function splitKeypath(keypath: Keypath): string[] {
  const result: string[] = [];
  let match: RegExpExecArray;

  keypath = normalise(keypath);

  while ((match = splitPattern.exec(keypath))) {
    const index = match.index + match[1].length;
    result.push(keypath.substr(0, index));
    keypath = keypath.substr(index + 1);
  }

  result.push(keypath);

  return result;
}

export function unescapeKey<T>(key: T): T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unescapeKey(key: any): any {
  if (isString(key)) {
    return key.replace(unescapeKeyPattern, '$1$2');
  }

  return key;
}
