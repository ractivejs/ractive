import { findInViewHierarchy } from 'shared/registry';

// TODO add correct typings

export function findPlugin(name: string, type: string, instance) {
  return findInViewHierarchy(type, instance, name);
}
