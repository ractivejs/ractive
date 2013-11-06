define([
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getNumberLiteral',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getBooleanLiteral',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/_index',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getObjectLiteral/_index',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getArrayLiteral'
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