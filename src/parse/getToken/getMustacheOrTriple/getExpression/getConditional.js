define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getLogicalOr'
], function (
	types,
	allowWhitespace,
	getStringMatch,
	getLogicalOr
) {
	
	'use strict';

	var getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	// The conditional operator is the lowest precedence operator, so we start here
	return function ( tokenizer ) {
		var start, expression, ifTrue, ifFalse;

		expression = getLogicalOr( tokenizer );
		if ( !expression ) {
			return null;
		}

		start = tokenizer.pos;

		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '?' ) ) {
			tokenizer.pos = start;
			return expression;
		}

		allowWhitespace( tokenizer );

		ifTrue = getExpression( tokenizer );
		if ( !ifTrue ) {
			tokenizer.pos = start;
			return expression;
		}

		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, ':' ) ) {
			tokenizer.pos = start;
			return expression;
		}

		allowWhitespace( tokenizer );

		ifFalse = getExpression( tokenizer );
		if ( !ifFalse ) {
			tokenizer.pos = start;
			return expression;
		}

		return {
			t: types.CONDITIONAL,
			o: [ expression, ifTrue, ifFalse ]
		};
	};

});