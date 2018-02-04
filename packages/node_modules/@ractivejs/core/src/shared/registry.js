export function findInViewHierarchy ( registryName, ractive, name ) {
	const instance = findInstance( registryName, ractive, name );
	return instance ? instance[ registryName ][ name ] : null;
}

export function findInstance ( registryName, ractive, name ) {
	while ( ractive ) {
		if ( name in ractive[ registryName ] ) {
			return ractive;
		}

		if ( ractive.isolated ) {
			return null;
		}

		ractive = ractive.parent;
	}
}