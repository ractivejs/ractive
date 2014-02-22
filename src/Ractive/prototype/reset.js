define([
	'utils/makeTransitionManager',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	makeTransitionManager,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( data, complete ) {
		var transitionManager;

		if ( typeof data === 'function' ) {
			complete = data;
			data = {};
		}

		if ( data !== undefined && typeof data !== 'object' ) {
			throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
		}

		// Manage transitions
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		this.data = data || {};

		clearCache( this, '' );
		notifyDependants( this, '' );

		this.fire( 'reset', data );

		// transition manager has finished its work
		transitionManager.ready();
	};

});
