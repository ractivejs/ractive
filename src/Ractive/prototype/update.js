define([
	'global/runloop',
	'shared/makeTransitionManager',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	runloop,
	makeTransitionManager,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( keypath, complete ) {
		var transitionManager;

		runloop.start( this );

		if ( typeof keypath === 'function' ) {
			complete = keypath;
			keypath = '';
		}

		// manage transitions
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// if we're using update, it's possible that we've introduced new values, and
		// some unresolved references can be dealt with
		clearCache( this, keypath || '' );
		notifyDependants( this, keypath || '' );

		runloop.end();

		// transition manager has finished its work
		transitionManager.init();

		if ( typeof keypath === 'string' ) {
			this.fire( 'update', keypath );
		} else {
			this.fire( 'update' );
		}

		return this;
	};

});
