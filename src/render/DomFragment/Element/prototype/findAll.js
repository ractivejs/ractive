define([ 'utils/matches' ], function ( matches ) {
	
	'use strict';

	return function ( selector, options, list ) {
		var queryAllResult, i, numNodes;

		if ( matches( this.node, selector ) ) {
			list.push( this.node );
		}

		if ( this.html && ( queryAllResult = this.node.querySelectorAll( selector ) ) ) {
			numNodes = queryAllResult.length;
			for ( i = 0; i < numNodes; i += 1 ) {
				list.push( queryAllResult[i] );
			}
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, options, list );
		}
	};

});