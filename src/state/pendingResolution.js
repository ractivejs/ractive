define([
	'utils/removeFromArray',
	'shared/resolveRef'
], function (
	removeFromArray,
	resolveRef
) {

	'use strict';

	var pendingResolution = [];

	// TODO optimise when/why this happens!
	pendingResolution.check = function () {
		var clone, unresolved, keypath;

		if ( !pendingResolution.length ) {
			return;
		}

		clone = pendingResolution.splice( 0 );

		// See if we can resolve any of the unresolved keypaths (if such there be)
		while ( unresolved = clone.pop() ) {
			if ( unresolved.keypath ) {
				continue; // it did resolve after all
			}

			keypath = resolveRef( unresolved.root, unresolved.ref, unresolved.contextStack );

			if ( keypath !== undefined ) {
				// If we've resolved the keypath, we can initialise this item
				unresolved.resolve( keypath );
			} else {
				// If we can't resolve the reference, try again next time
				pendingResolution.push( unresolved );
			}
		}
	};

	pendingResolution.remove = function ( thing ) {
		removeFromArray( pendingResolution, thing );
	};

	return pendingResolution;

});
