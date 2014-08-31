define(['Ractive/prototype/shared/add'],function (add) {

	'use strict';
	
	return function Ractive$subtract ( keypath, d ) {
		return add( this, keypath, ( d === undefined ? -1 : -d ) );
	};

});