import { escapeKey, splitKeypath as splitKeypathI, unescapeKey } from 'shared/keypaths';
import type { Keypath } from 'types/Generic';

export function joinKeys(...keys: (string | number | (string | number)[])[]): Keypath {
  return keys.map(escapeKey).join('.');
}

export function splitKeypath(keypath: Keypath): string[] {
  return splitKeypathI(keypath).map(unescapeKey);
}
