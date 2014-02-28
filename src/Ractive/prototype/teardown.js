// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself
define([
	'config/types',
	'shared/makeTransitionManager',
	'shared/clearCache',
	'global/css'
], function (
	types,
	makeTransitionManager,
	clearCache,
	css
) {

	'use strict';

	return function ( complete ) {
		var keypath, transitionManager, shouldDestroy, originalComplete, fragment, nearestDetachingElement, failedLookup;

		this.fire( 'teardown' );

		// If this is a component, and the component isn't marked for destruction,
		// don't detach nodes from the DOM unnecessarily
		shouldDestroy = !this.component || this.component.shouldDestroy;

		if ( this.constructor.css ) {
			// We need to find the nearest detaching element. When it gets removed
			// from the DOM, it's safe to remove our CSS
			if ( shouldDestroy ) {
				originalComplete = complete;
				complete = function () {
					if ( originalComplete ) {
						originalComplete.call( this );
					}

					css.remove( this.constructor );
				};
			} else {
				fragment = this.component.parentFragment;

				do {
					if ( fragment.owner.type !== types.ELEMENT ) {
						continue;
					}

					if ( fragment.owner.willDetach ) {
						nearestDetachingElement = fragment.owner;
					}
				} while ( !nearestDetachingElement && ( fragment = fragment.parent ) );

				if ( !nearestDetachingElement ) {
					throw new Error( 'A component is being torn down but doesn\'t have a nearest detaching element... this shouldn\'t happen!' );
				}

				nearestDetachingElement.cssDetachQueue.push( this.constructor );
			}
		}

		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		this.fragment.teardown( shouldDestroy );

		// Cancel any animations in progress
		while ( this._animations[0] ) {
			this._animations[0].stop(); // it will remove itself from the index
		}

		// Clear cache - this has the side-effect of unregistering keypaths from modified arrays.
		for ( keypath in this._cache ) {
			clearCache( this, keypath );
		}

		// Teardown any failed lookups - we don't need them to resolve any more
		while ( failedLookup = this._failedLookups.pop() ) {
			failedLookup.teardown();
		}

		// transition manager has finished its work
		transitionManager.init();
	};

});
