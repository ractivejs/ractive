define(['config/types','parse/Parser/expressions/primary/literal/objectLiteral/keyValuePairs'],function (types, getKeyValuePairs) {

	'use strict';
	
	return function ( parser ) {
		var start, keyValuePairs;
	
		start = parser.pos;
	
		// allow whitespace
		parser.allowWhitespace();
	
		if ( !parser.matchString( '{' ) ) {
			parser.pos = start;
			return null;
		}
	
		keyValuePairs = getKeyValuePairs( parser );
	
		// allow whitespace between final value and '}'
		parser.allowWhitespace();
	
		if ( !parser.matchString( '}' ) ) {
			parser.pos = start;
			return null;
		}
	
		return {
			t: types.OBJECT_LITERAL,
			m: keyValuePairs
		};
	};

});