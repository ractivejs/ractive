// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
define([
	'shared/makeTransitionManager',
	'shared/clearCache'
], function (
	makeTransitionManager,
	clearCache
) {

	'use strict';

	return function ( complete ) {
		var keypath, transitionManager, previousTransitionManager;

		this.fire( 'teardown' );

		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		this.fragment.teardown( true );

		// Cancel any animations in progress
		while ( this._animations[0] ) {
			this._animations[0].stop(); // it will remove itself from the index
		}

		// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
		for ( keypath in this._cache ) {
			clearCache( this, keypath );
		}

		// transition manager has finished its work
		this._transitionManager = previousTransitionManager;
		transitionManager.ready();
	};

});