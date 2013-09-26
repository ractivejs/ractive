proto.update = function ( keypath, complete ) {
	var transitionManager, previousTransitionManager;

	if ( typeof keypath === 'function' ) {
		complete = keypath;
		keypath = '';
	}

	// if we're using update, it's possible that we've introduced new values, and
	// some unresolved references can be dealt with
	attemptKeypathResolution( this );

	// manage transitions
	previousTransitionManager = this._transitionManager;
	this._transitionManager = transitionManager = makeTransitionManager( this, complete );

	clearCache( this, keypath || '' );
	notifyDependants( this, keypath || '' );

	processDeferredUpdates( this );

	// transition manager has finished its work
	this._transitionManager = previousTransitionManager;
	transitionManager.ready();

	if ( typeof keypath === 'string' ) {
		this.fire( 'update', keypath );
	} else {
		this.fire( 'update' );
	}

	return this;
};