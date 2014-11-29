export default function Viewmodel$teardown () {
	var unresolvedImplicitDependency, reversedMappings;

	// Clear entire cache - this has the desired side-effect
	// of unwrapping adapted values (e.g. arrays)
	Object.keys( this.cache ).forEach( keypath => this.clearCache( keypath ) );

	// Unbind reversed mappings, which will revert ownership of the data
	if ( reversedMappings = this.reversedMappings ) {
		Object.keys( reversedMappings ).forEach( key => reversedMappings[ key ].unbind() );
	}

	// Teardown any failed lookups - we don't need them to resolve any more
	while ( unresolvedImplicitDependency = this.unresolvedImplicitDependencies.pop() ) {
		unresolvedImplicitDependency.teardown();
	}
}
