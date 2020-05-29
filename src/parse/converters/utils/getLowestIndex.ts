import escapeRegExp from 'utils/escapeRegExp';

const regExpCache = {};

export default function(haystack: string, needles: string[]): number {
  return haystack.search(
    regExpCache[needles.join()] ||
      (regExpCache[needles.join()] = new RegExp(needles.map(escapeRegExp).join('|')))
  );
}
