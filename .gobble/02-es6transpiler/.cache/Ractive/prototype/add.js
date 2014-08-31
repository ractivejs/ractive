define(['Ractive/prototype/shared/add'],function (add) {

	'use strict';
	
	return function Ractive$add ( keypath, d ) {
		return add( this, keypath, ( d === undefined ? 1 : +d ) );
	};

});