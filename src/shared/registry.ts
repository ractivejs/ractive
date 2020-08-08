import { RactiveFake } from 'types/RactiveFake';
import { Registries } from 'types/Registries';

type RegistryName = keyof Registries;

export function findInViewHierarchy<K extends RegistryName>(
  registryName: K,
  ractive: RactiveFake,
  name: string
): Registries[K]['value'] | null {
  const instance = findInstance(registryName, ractive, name);
  return instance ? instance[registryName][name] : null;
}

export function findInstance<K extends RegistryName>(
  registryName: K,
  ractive: RactiveFake,
  name: string
): RactiveFake | null {
  while (ractive) {
    if (name in ractive[registryName]) {
      return ractive;
    }

    if (ractive.isolated) {
      return null;
    }

    ractive = ractive.parent;
  }
}
