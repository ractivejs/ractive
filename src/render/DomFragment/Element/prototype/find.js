define([ 'utils/matches' ], function ( matches ) {
	
	'use strict';

	return function ( selector ) {
		var queryResult;

		if ( matches( this.node, selector ) ) {
			return this.node;
		}

		if ( this.html && ( queryResult = this.node.querySelector( selector ) ) ) {
			return queryResult;
		}

		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	};

});