define([
	'render/DomFragment/Element/shared/getMatchingStaticNodes'
], function (
	getMatchingStaticNodes
) {

	'use strict';

	return function ( selector, query ) {
		var matchingStaticNodes, matchedSelf;

		// Add this node to the query, if applicable, and register the
		// query on this element
		if ( query._test( this, true ) && query.live ) {
			( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
		}

		if ( this.html ) {
			matchingStaticNodes = getMatchingStaticNodes( this, selector );
			query.push.apply( query, matchingStaticNodes );

			if ( query.live && !matchedSelf ) {
				( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
			}
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	};

});
