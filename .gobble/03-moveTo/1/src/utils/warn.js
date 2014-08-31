define(function () {

	'use strict';
	
	/* global console */
	var warn, warned = {};
	
	if ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' ) {
		warn = function ( message, allowDuplicates ) {
			if ( !allowDuplicates ) {
				if ( warned[ message ] ) {
					return;
				}
	
				warned[ message ] = true;
			}
	
			console.warn( message );
		};
	} else {
		warn = function () {};
	}
	
	return warn;

});