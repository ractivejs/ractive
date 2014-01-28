define( function () {

	'use strict';

	return function ( dependant ) {
		dependant.root._pendingResolution.push( dependant );
	};

});