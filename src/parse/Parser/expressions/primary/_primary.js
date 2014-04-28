define([
	'parse/Parser/expressions/primary/literal/_literal',
	'parse/Parser/expressions/primary/reference',
	'parse/Parser/expressions/primary/bracketedExpression'
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
