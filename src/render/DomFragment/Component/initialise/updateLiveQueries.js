define( function () {

	'use strict';

	return function ( component ) {
		var query;

		if ( query = component.root._liveComponentQueries[ component.name ] ) {
			query.push( component.instance );
		}
	};

});