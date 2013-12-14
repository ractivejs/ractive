define([
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/_getLiteral',
	'parse/Tokenizer/getExpression/getPrimary/getReference',
	'parse/Tokenizer/getExpression/getPrimary/getBracketedExpression'
], function (
	getLiteral,
	getReference,
	getBracketedExpression
) {
	
	'use strict';

	return function ( tokenizer ) {
		return getLiteral( tokenizer )
		    || getReference( tokenizer )
		    || getBracketedExpression( tokenizer );
	};

});