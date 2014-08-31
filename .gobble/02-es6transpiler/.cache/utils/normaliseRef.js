define(function () {

	'use strict';
	
	var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
	
	return function normaliseRef ( ref ) {
		return ( ref || '' ).replace( regex, '.$1' );
	};

});