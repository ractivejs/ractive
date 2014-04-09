define( function () {

	'use strict';

	return function ( element ) {
		var instance, liveQueries, i, selector, query;

		// Does this need to be added to any live queries?
		instance = element.root;

		do {
			liveQueries = instance._liveQueries;

			i = liveQueries.length;
			while ( i-- ) {
				selector = liveQueries[i];
				query = liveQueries[ selector ];

				if ( query._test( element ) ) {
					// keep register of applicable selectors, for when we teardown
					( element.liveQueries || ( element.liveQueries = [] ) ).push( query );
				}
			}
		} while ( instance = instance._parent );
	};

});
