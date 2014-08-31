define(['config/types'],function (types) {

	'use strict';
	
	return function ( parser ) {
		var remaining = parser.remaining();
	
		if ( remaining.substr( 0, 4 ) === 'true' ) {
			parser.pos += 4;
			return {
				t: types.BOOLEAN_LITERAL,
				v: 'true'
			};
		}
	
		if ( remaining.substr( 0, 5 ) === 'false' ) {
			parser.pos += 5;
			return {
				t: types.BOOLEAN_LITERAL,
				v: 'false'
			};
		}
	
		return null;
	};

});