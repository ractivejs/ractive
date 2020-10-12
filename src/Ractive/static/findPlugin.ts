import { findInViewHierarchy } from 'shared/registry';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { Registries } from 'types/Registries';

/** This function is exposed but it seems not documented */
export function findPlugin<K extends keyof Registries>(
  name: string,
  type: K,
  instance: Ractive
): Registries[K]['value'] {
  return findInViewHierarchy(type, instance, name);
}
