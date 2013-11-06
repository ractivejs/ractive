define([
	'config/types',
	'parse/Tokenizer/utils/makeRegexMatcher',
	'parse/Tokenizer/getMustache/getMustacheType'
], function (
	types,
	makeRegexMatcher,
	getMustacheType
) {
	
	'use strict';

	var getIndexRef = makeRegexMatcher( /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/ );

	return function ( tokenizer, isTriple ) {
		var start, mustache, type, expr, i, remaining, index;

		start = tokenizer.pos;

		mustache = { type: isTriple ? types.TRIPLE : types.MUSTACHE };

		// mustache type
		if ( !isTriple ) {
			type = getMustacheType( tokenizer );
			mustache.mustacheType = type || types.INTERPOLATOR; // default

			// if it's a comment or a section closer, allow any contents except '}}'
			if ( type === types.COMMENT || type === types.CLOSING ) {
				remaining = tokenizer.remaining();
				index = remaining.indexOf( tokenizer.delimiters[1] );

				if ( index !== -1 ) {
					mustache.ref = remaining.substr( 0, index );
					tokenizer.pos += index;
					return mustache;
				}
			}
		}

		// allow whitespace
		tokenizer.allowWhitespace();

		// get expression
		expr = tokenizer.getExpression();

		while ( expr.t === types.BRACKETED && expr.x ) {
			expr = expr.x;
		}

		if ( expr.t === types.REFERENCE ) {
			mustache.ref = expr.n;
		} else {
			mustache.expression = expr;
		}

		// optional index reference
		i = getIndexRef( tokenizer );
		if ( i !== null ) {
			mustache.indexRef = i;
		}

		return mustache;
	};

});