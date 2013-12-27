define([ 'Ractive/prototype/shared/add' ], function ( add ) {

	'use strict';

	return function ( keypath, d ) {
		add( this, keypath, ( d === undefined ? 1 : d ) );
	};

});