import { findInViewHierarchy } from '../../shared/registry';

export function findPlugin(name, type, instance) {
	return findInViewHierarchy(type, instance, name);
}
