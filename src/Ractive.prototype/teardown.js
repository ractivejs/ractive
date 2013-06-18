// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
proto.teardown = function ( complete ) {
	var keypath, transitionManager;

	this.fire( 'teardown' );

	this._transitionManager = transitionManager = makeTransitionManager( complete );

	this.fragment.teardown( true );

	// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
	for ( keypath in this._cache ) {
		clearCache( this, keypath );
	}

	// Teardown any bindings
	while ( this._bound.length ) {
		this.unbind( this._bound.pop() );
	}

	// transition manager has finished its work
	this._transitionManager = null;
	transitionManager.ready = true;
	if ( complete && !transitionManager.active ) {
		complete.call( this );
	}
};