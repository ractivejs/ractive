// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
proto.teardown = function ( callback ) {
	var keypath, transitionManager;

	this.fire( 'teardown' );

	this._transitionManager = transitionManager = makeTransitionManager( callback );

	this.fragment.teardown( true );

	// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
	/*// Once with keypaths that have dependents...
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
	}*/
	for ( keypath in this._cache ) {
		clearCache( this, keypath ); // TODO inherit cache from null so we don't need hasOwnProperty
	}

	// Teardown any bindings
	while ( this._bound.length ) {
		this.unbind( this._bound.pop() );
	}

	// TODO other stuff... evaluators etc

	// transition manager has finished its work
	this._transitionManager = null;
	transitionManager.ready = true;
	if ( callback && !transitionManager.active ) {
		callback();
	}
};