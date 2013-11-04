define([
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getNumberLiteral',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getBooleanLiteral',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getStringLiteral/_index',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getObjectLiteral/_index',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getArrayLiteral'
], function (
	getNumberLiteral,
	getBooleanLiteral,
	getStringLiteral,
	getObjectLiteral,
	getArrayLiteral
) {
	
	'use strict';

	return function ( tokenizer ) {
		var literal = getNumberLiteral( tokenizer )   ||
		              getBooleanLiteral( tokenizer )  ||
		              getStringLiteral( tokenizer )   ||
		              getObjectLiteral( tokenizer )   ||
		              getArrayLiteral( tokenizer );

		return literal;
	};

});