define([
	'state/pendingResolution',
	'shared/unregisterDependant'
], function (
	pendingResolution,
	unregisterDependant
) {

	'use strict';

	return function ( thing ) {
		if ( !thing.keypath ) {
			// this was on the 'unresolved' list, we need to remove it
			pendingResolution.remove( thing );
		} else {
			// this was registered as a dependant
			unregisterDependant( thing );
		}
	};

});
