// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
define([
	'shared/makeTransitionManager',
	'shared/clearCache',
	'state/css'
], function (
	makeTransitionManager,
	clearCache,
	css
) {

	'use strict';

	return function ( complete ) {
		var keypath, transitionManager, previousTransitionManager, shouldDestroy, actualComplete;

		this.fire( 'teardown' );

		if ( this.constructor.css ) {
			actualComplete = function () {
				if ( complete ) {
					complete.call( this );
				}

				css.remove( this.constructor );
			};
		} else {
			actualComplete = complete;
		}

		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, actualComplete );

		// If this is a component, and the component isn't marked for destruction,
		// don't detach nodes from the DOM unnecessarily
		shouldDestroy = !this.component || this.component.shouldDestroy;

		this.fragment.teardown( shouldDestroy );

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
		transitionManager.init();
	};

});
