define([ 'utils/matches' ], function ( matches ) {
	
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

			if ( matches( element.node, selector ) ) {
				query.push( element.node );
				
				if ( !query._dirty ) {
					ractive._defLiveQueries.push( query );
					query._dirty = true;
				}
			}
		}
	};

});