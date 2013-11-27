define([ 'utils/matches' ], function ( matches ) {
	
	'use strict';

	return function ( selector, options, query ) {
		var queryAllResult, i, numNodes, node, registeredNodes;

		if ( query._test( this.node ) ) {
			( this.liveQueries || ( this.liveQueries = [] ) ).push( selector );
			this.liveQueries[ selector ] = [ this.node ];
		}

		if ( this.html && ( queryAllResult = this.node.querySelectorAll( selector ) ) && ( numNodes = queryAllResult.length ) ) {
			if ( !this.liveQueries[ selector ] ) {
				( this.liveQueries || ( this.liveQueries = [] ) ).push( selector );
				this.liveQueries[ selector ] = [];
			}

			registeredNodes = this.liveQueries[ selector ];

			for ( i = 0; i < numNodes; i += 1 ) {
				node = queryAllResult[i];
				query.push( node );
				registeredNodes.push( node );
			}
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, options, query );
		}
	};

});