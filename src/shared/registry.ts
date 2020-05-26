// TODO add correct typings

export function findInViewHierarchy(registryName: string, ractive, name: string) {
  const instance = findInstance(registryName, ractive, name);
  return instance ? instance[registryName][name] : null;
}

export function findInstance(registryName: string, ractive, name: string) {
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
