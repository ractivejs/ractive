define( function () {

	'use strict';

	return function ( element ) {
		var ractive, liveQueries, i, selector, query;

		// Does this need to be added to any live queries?
		ractive = element.root;
		liveQueries = ractive._liveQueries;

		i = liveQueries.length;
		while ( i-- ) {
			selector = liveQueries[i];
			query = liveQueries[ selector ];

			if ( query._test( element ) ) {
				// keep register of applicable selectors, for when we teardown
				( element.liveQueries || ( element.liveQueries = [] ) ).push( selector );
				element.liveQueries[ selector ] = [ element.node ];
			}
		}
	};

});
