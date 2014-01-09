define([
	'shared/makeTransitionManager',
	'shared/attemptKeypathResolution',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/midCycleUpdate',
	'shared/endCycleUpdate'
], function (
	makeTransitionManager,
	attemptKeypathResolution,
	clearCache,
	notifyDependants,
	midCycleUpdate,
	endCycleUpdate
) {

	'use strict';

	return function ( keypath, complete ) {
		var transitionManager, previousTransitionManager, endCycleUpdateRequired;

		if ( !this._updateScheduled ) {
			endCycleUpdateRequired = this._updateScheduled = true;
		}

		if ( typeof keypath === 'function' ) {
			complete = keypath;
			keypath = '';
		}

		// manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// if we're using update, it's possible that we've introduced new values, and
		// some unresolved references can be dealt with
		attemptKeypathResolution( this );

		clearCache( this, keypath || '' );
		notifyDependants( this, keypath || '' );

		midCycleUpdate( this );

		if ( endCycleUpdateRequired ) {
			endCycleUpdate( this );
		}

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