import { findInViewHierarchy } from 'shared/registry';
import { RactiveFake } from 'types/RactiveFake';
import { Registries } from 'types/Registries';

/** This function is exposed but it seems not documented */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function findPlugin<K extends keyof Registries>(
  name: string,
  type: K,
  instance: RactiveFake
) {
  return findInViewHierarchy(type, instance, name);
}
