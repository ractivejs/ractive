define([
	'state/pendingResolution',
	'utils/makeTransitionManager',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	pendingResolution,
	makeTransitionManager,
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
		pendingResolution.check();

		clearCache( this, '' );
		notifyDependants( this, '' );

		this.fire( 'reset', data );

		// transition manager has finished its work
		this._transitionManager = previousTransitionManager;
		transitionManager.ready();
	};

});
