define([
	'state/scheduler',
	'shared/makeTransitionManager',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	scheduler,
	makeTransitionManager,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( keypath, complete ) {
		var transitionManager, previousTransitionManager;

		scheduler.start();

		if ( typeof keypath === 'function' ) {
			complete = keypath;
			keypath = '';
		}

		// manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// if we're using update, it's possible that we've introduced new values, and
		// some unresolved references can be dealt with
		clearCache( this, keypath || '' );
		notifyDependants( this, keypath || '' );

		scheduler.end();

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

});
