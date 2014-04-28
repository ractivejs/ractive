define([
	'parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral',
	'parse/Parser/expressions/primary/literal/numberLiteral',
	'parse/Parser/expressions/patterns'
], function (
	getStringLiteral,
	getNumberLiteral,
	patterns
) {

	'use strict';

	var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

	// http://mathiasbynens.be/notes/javascript-properties
	// can be any name, string literal, or number literal
	return function ( parser ) {
		var token;

		if ( token = getStringLiteral( parser ) ) {
			return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
		}

		if ( token = getNumberLiteral( parser ) ) {
			return token.v;
		}

		if ( token = parser.matchPattern( patterns.name ) ) {
			return token;
		}
	};

});
