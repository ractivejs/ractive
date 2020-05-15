import { isString } from 'utils/is';

const refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
const splitPattern = /([^\\](?:\\\\)*)\./;
const escapeKeyPattern = /\\|\./g;
const unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

export function escapeKey(key: string): string {
  if (isString(key)) {
    return key.replace(escapeKeyPattern, '\\$&');
  }

  return key;
}

export function normalise(ref: string): string {
  return ref ? ref.replace(refPattern, '.$1') : '';
}

export function splitKeypath(keypath: string): string[] {
  const result = [];
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

export function unescapeKey(key: string): string {
  if (isString(key)) {
    return key.replace(unescapeKeyPattern, '$1$2');
  }

  return key;
}
