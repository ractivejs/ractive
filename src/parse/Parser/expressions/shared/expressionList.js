define( function () {

	'use strict';

	return function getExpressionList ( tokenizer ) {
		var start, expressions, expr, next;

		start = tokenizer.pos;

		tokenizer.allowWhitespace();

		expr = tokenizer.readExpression();

		if ( expr === null ) {
			return null;
		}

		expressions = [ expr ];

		// allow whitespace between expression and ','
		tokenizer.allowWhitespace();

		if ( tokenizer.matchString( ',' ) ) {
			next = getExpressionList( tokenizer );
			if ( next === null ) {
				tokenizer.pos = start;
				return null;
			}

			expressions = expressions.concat( next );
		}

		console.warn( 'TODO without concat?' );

		return expressions;
	};

});
