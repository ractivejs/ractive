define([
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/_getStringLiteral',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getNumberLiteral',
	'parse/Tokenizer/getExpression/shared/getName'
], function (
	getStringLiteral,
	getNumberLiteral,
	getName
) {
	
	'use strict';

	var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

	// http://mathiasbynens.be/notes/javascript-properties
	// can be any name, string literal, or number literal
	return function ( tokenizer ) {
		var token;

		if ( token = getStringLiteral( tokenizer ) ) {
			return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
		}

		if ( token = getNumberLiteral( tokenizer ) ) {
			return token.v;
		}

		if ( token = getName( tokenizer ) ) {
			return token;
		}
	};

});