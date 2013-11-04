define([
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/_index',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getReference',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getBracketedExpression'
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