define([
	'config/types',
	'parse/Tokenizer/getExpression/shared/getName',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/_index', // TODO should these be higher in the tree?
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getNumberLiteral'
], function (
	types,
	getName,
	getStringLiteral,
	getNumberLiteral
) {
	
	'use strict';

	return function ( tokenizer ) {
		var start, key, value;

		start = tokenizer.pos;

		// allow whitespace between '{' and key
		tokenizer.allowWhitespace();

		key = getKey( tokenizer );
		if ( key === null ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between key and ':'
		tokenizer.allowWhitespace();

		// next character must be ':'
		if ( !tokenizer.getStringMatch( ':' ) ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between ':' and value
		tokenizer.allowWhitespace();

		// next expression must be a, well... expression
		value = tokenizer.getExpression();
		if ( value === null ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.KEY_VALUE_PAIR,
			k: key,
			v: value
		};
	};


	// http://mathiasbynens.be/notes/javascript-properties
	// can be any name, string literal, or number literal
	function getKey ( tokenizer ) {
		return getName( tokenizer ) || getStringLiteral( tokenizer ) || getNumberLiteral( tokenizer );
	}

});