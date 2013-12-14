define( function () {

	'use strict';

	// TODO can this be neatened up at all?
	return function ( ractive ) {
		var deferred, focusable, query, decorator, transition, observer;

		deferred = ractive._deferred;

		if ( focusable = deferred.focusable ) {
			focusable.focus();
			deferred.focusable = null;
		}

		while ( query = deferred.liveQueries.pop() ) {
			query._sort();
		}

		while ( decorator = deferred.decorators.pop() ) {
			decorator.init();
		}

		while ( transition = deferred.transitions.pop() ) {
			transition.init(); // TODO rename...
		}

		while ( observer = deferred.observers.pop() ) {
			observer.update();
		}
	};

});