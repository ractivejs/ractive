define([ 'parse/Parser/_index' ], function ( Parser ) {

	'use strict';

	return function ( tokens, options ) {
		var parser = new Parser( tokens, options );
		return parser.result;
	};

});