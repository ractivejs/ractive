define([
	'config/types',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/utils/allowWhitespace'
], function (
	types,
	getStringMatch,
	allowWhitespace
) {
	
	'use strict';

	var getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	return function ( tokenizer ) {
		var start, expr;

		start = tokenizer.pos;

		if ( !getStringMatch( tokenizer, '(' ) ) {
			return null;
		}

		allowWhitespace( tokenizer );

		expr = getExpression( tokenizer );
		if ( !expr ) {
			tokenizer.pos = start;
			return null;
		}

		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, ')' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.BRACKETED,
			x: expr
		};
	};

});