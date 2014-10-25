export default function Viewmodel$teardown () {
	var key, mapping, unresolvedImplicitDependency;

	// Unregister mappings
	for ( key in this.mappings ) {
		mapping = this.mappings[ key ];
		mapping.origin.unregister( mapping.keypath, mapping, 'mappings' );
	}

	// Clear entire cache - this has the desired side-effect
	// of unwrapping adapted values (e.g. arrays)
	Object.keys( this.cache ).forEach( keypath => this.clearCache( keypath ) );

	// Teardown any failed lookups - we don't need them to resolve any more
	while ( unresolvedImplicitDependency = this.unresolvedImplicitDependencies.pop() ) {
		unresolvedImplicitDependency.teardown();
	}
}
