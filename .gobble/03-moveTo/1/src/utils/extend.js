define(function () {

	'use strict';
	
	return function ( target ) {var SLICE$0 = Array.prototype.slice;var sources = SLICE$0.call(arguments, 1);
		var prop, source;
	
		while ( source = sources.shift() ) {
			for ( prop in source ) {
				if ( source.hasOwnProperty ( prop ) ) {
					target[ prop ] = source[ prop ];
				}
			}
		}
	
		return target;
	};

});