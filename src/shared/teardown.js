define([
	'global/runloop',
	'shared/unregisterDependant'
], function (
	runloop,
	unregisterDependant
) {

	'use strict';

	return function ( thing ) {
		if ( !thing.keypath ) {
			// this was on the 'unresolved' list, we need to remove it
			runloop.removeUnresolved( thing );
		} else {
			// this was registered as a dependant
			unregisterDependant( thing );
		}
	};

});
