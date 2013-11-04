define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/shared/getName',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getStringLiteral/_index', // TODO should these be higher in the tree?
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getNumberLiteral'
], function (
	types,
	allowWhitespace,
	getStringMatch,
	getName,
	getStringLiteral,
	getNumberLiteral
) {
	
	'use strict';

	// http://mathiasbynens.be/notes/javascript-properties
	// can be any name, string literal, or number literal
	var getKey, getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	getKey = function ( tokenizer ) {
		return getName( tokenizer ) || getStringLiteral( tokenizer ) || getNumberLiteral( tokenizer );
	};

	return function ( tokenizer ) {
		var start, key, value;

		start = tokenizer.pos;

		// allow whitespace between '{' and key
		allowWhitespace( tokenizer );

		key = getKey( tokenizer );
		if ( key === null ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between key and ':'
		allowWhitespace( tokenizer );

		// next character must be ':'
		if ( !getStringMatch( tokenizer, ':' ) ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between ':' and value
		allowWhitespace( tokenizer );

		// next expression must be a, well... expression
		value = getExpression( tokenizer );
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

});