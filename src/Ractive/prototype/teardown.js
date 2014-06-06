import Promise from 'utils/Promise';

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown ( callback ) {
	var keypath, promise, unresolvedImplicitDependency;

	this.fire( 'teardown' );
	this.fragment.teardown();

	// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
	this.viewmodel.clearCache();

	// Teardown any failed lookups - we don't need them to resolve any more
	while ( unresolvedImplicitDependency = this._unresolvedImplicitDependencies.pop() ) {
		unresolvedImplicitDependency.teardown();
	}

	promise = ( this.rendered ? this.unrender() : Promise.resolve() );

	if ( callback ) {
		// TODO deprecate this?
		promise.then( callback.bind( this ) );
	}

	return promise;
}
