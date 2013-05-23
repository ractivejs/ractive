// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
proto.teardown = function () {
	var keypath;

	this.rendered.teardown();

	// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
	// Once with keypaths that have dependents...
	for ( keypath in this._depsMap ) {
		if ( this._depsMap.hasOwnProperty( keypath ) ) {
			clearCache( this, keypath );
		}
	}

	// Then a second time to mop up the rest
	for ( keypath in this._cache ) {
		if ( this._cache.hasOwnProperty( keypath ) ) {
			clearCache( this, keypath );
		}
	}

	// Teardown any bindings
	while ( this._bound.length ) {
		this.unbind( this._bound.pop() );
	}
};