export default function diff ( computation, dependencies, newDependencies ) {
	var i, keypath;

	// remove dependencies that are no longer used
	i = dependencies.length;
	while ( i-- ) {
		keypath = dependencies[i];

		if ( newDependencies.indexOf( keypath ) === -1 ) {
			computation.viewmodel.unregister( keypath, computation, 'computed' );
		}
	}

	// create references for any new dependencies
	i = newDependencies.length;
	while ( i-- ) {
		keypath = newDependencies[i];

		if ( dependencies.indexOf( keypath ) === -1 ) {
			computation.viewmodel.register( keypath, computation, 'computed' );
		}
	}

	computation.dependencies = newDependencies.slice();
}
