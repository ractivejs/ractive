proto.update = function ( keypath, complete ) {
	
	if ( typeof keypath === 'function' ) {
		complete = keypath;
	}

	// manage transitions
	this._transitionManager = transitionManager = makeTransitionManager( complete );

	clearCache( this, keypath || '' );
	notifyDependants( this, keypath || '' );

	processDeferredUpdates( this );

	// transition manager has finished its work
	this._transitionManager = null;
	transitionManager.ready = true;
	if ( complete && !transitionManager.active ) {
		complete.call( this );
	}

	if ( typeof keypath === 'string' ) {
		this.fire( 'update', keypath );
	} else {
		this.fire( 'update' );
	}

	return this;
};