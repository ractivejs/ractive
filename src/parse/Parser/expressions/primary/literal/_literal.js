define([
	'parse/Parser/expressions/primary/literal/numberLiteral',
	'parse/Parser/expressions/primary/literal/booleanLiteral',
	'parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral',
	'parse/Parser/expressions/primary/literal/objectLiteral/_objectLiteral',
	'parse/Parser/expressions/primary/literal/arrayLiteral'
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
