import { escapeKey, splitKeypath as splitKeypathI, unescapeKey } from 'shared/keypaths';
import { Keypath } from 'types/Keypath';

export function joinKeys(...keys: string[]): Keypath {
  return keys.map(escapeKey).join('.');
}

export function splitKeypath(keypath: Keypath): string[] {
  return splitKeypathI(keypath).map(unescapeKey);
}
