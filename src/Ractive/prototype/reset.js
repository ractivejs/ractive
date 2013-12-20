define([
	'utils/makeTransitionManager',
	'shared/attemptKeypathResolution',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	makeTransitionManager,
	attemptKeypathResolution,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( data, complete ) {
		var transitionManager, previousTransitionManager;

		if ( typeof data === 'function' ) {
			complete = data;
			data = {};
		}

		if ( data !== undefined && typeof data !== 'object' ) {
			throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
		}

		// Manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		this.data = data || {};

		// Attempt to resolve any unresolved keypaths...
		if ( this._pendingResolution.length ) {
			attemptKeypathResolution( this );
		}

		clearCache( this, '' );
		notifyDependants( this, '' );

		this.fire( 'reset', data );

		// transition manager has finished its work
		this._transitionManager = previousTransitionManager;
		transitionManager.ready();
	};

});