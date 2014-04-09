define([
	'Ractive/prototype/shared/makeQuery/_makeQuery'
], function (
	makeQuery
) {

	'use strict';

	return function ( selector, options ) {
		var liveQueries, query;

		options = options || {};
		liveQueries = this._liveComponentQueries;

		// Shortcut: if we're maintaining a live query with this
		// selector, we don't need to traverse the parallel DOM
		if ( query = liveQueries[ selector ] ) {

			// Either return the exact same query, or (if not live) a snapshot
			return ( options && options.live ) ? query : query.slice();
		}

		query = makeQuery( this, selector, !!options.live, true );

		// Add this to the list of live queries Ractive needs to maintain,
		// if applicable
		if ( query.live ) {
			liveQueries.push( selector );
			liveQueries[ selector ] = query;
		}

		this.fragment.findAllComponents( selector, query );
		return query;
	};

});
