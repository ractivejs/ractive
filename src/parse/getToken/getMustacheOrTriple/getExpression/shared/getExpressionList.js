define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch'
], function (
	types,
	allowWhitespace,
	getStringMatch
) {
	
	'use strict';

	var getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	
	return function getExpressionList ( tokenizer ) {
		var start, expressions, expr, next;

		start = tokenizer.pos;

		allowWhitespace( tokenizer );

		expr = getExpression( tokenizer );

		if ( expr === null ) {
			return null;
		}

		expressions = [ expr ];

		// allow whitespace between expression and ','
		allowWhitespace( tokenizer );

		if ( getStringMatch( tokenizer, ',' ) ) {
			next = getExpressionList( tokenizer );
			if ( next === null ) {
				tokenizer.pos = start;
				return null;
			}

			expressions = expressions.concat( next );
		}

		return expressions;
	};

});