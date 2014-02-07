define([
	'state/scheduler',
	'shared/unregisterDependant'
], function (
	scheduler,
	unregisterDependant
) {

	'use strict';

	return function ( thing ) {
		if ( !thing.keypath ) {
			// this was on the 'unresolved' list, we need to remove it
			scheduler.removeUnresolved( thing );
		} else {
			// this was registered as a dependant
			unregisterDependant( thing );
		}
	};

});
