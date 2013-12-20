define( function () {

	'use strict';

	return function ( selector, query ) {
		var queryAllResult, i, numNodes, node, registeredNodes;

		// Add this node to the query, if applicable, and register the
		// query on this element
		if ( query._test( this.node, true ) && query.live ) {
			( this.liveQueries || ( this.liveQueries = [] ) ).push( selector );
			this.liveQueries[ selector ] = [ this.node ];
		}

		if ( this.html && ( queryAllResult = this.node.querySelectorAll( selector ) ) && ( numNodes = queryAllResult.length ) ) {
			if ( query.live ) {
				if ( !this.liveQueries[ selector ] ) {
					( this.liveQueries || ( this.liveQueries = [] ) ).push( selector );
					this.liveQueries[ selector ] = [];
				}

				registeredNodes = this.liveQueries[ selector ];
			}

			for ( i = 0; i < numNodes; i += 1 ) {
				node = queryAllResult[i];
				query.push( node );

				if ( query.live ) {
					registeredNodes.push( node );
				}
			}
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	};

});