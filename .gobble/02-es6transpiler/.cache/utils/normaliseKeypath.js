define(['utils/normaliseRef'],function (normaliseRef) {

	'use strict';
	
	var leadingDot = /^\.+/;
	
	return function normaliseKeypath ( keypath ) {
		return normaliseRef( keypath ).replace( leadingDot, '' );
	};

});