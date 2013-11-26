define( function () {

	'use strict';

	// TODO can this be neatened up at all?
	return function ( ractive ) {
		while ( ractive._defLiveQueries.length ) {
			ractive._defLiveQueries.pop()._sort();
		}

		while ( ractive._defTransitions.length ) {
			ractive._defTransitions.pop().init(); // TODO rename...
		}

		while ( ractive._defObservers.length ) {
			ractive._defObservers.pop().update();
		}
	};

});