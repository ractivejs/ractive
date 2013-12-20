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

	var getIndexRef = makeRegexMatcher( /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/ ),
		arrayMember = /^[0-9][1-9]*$/;

	return function ( tokenizer, isTriple ) {
		var start, mustache, type, expr, i, remaining, index;

		start = tokenizer.pos;

		mustache = { type: isTriple ? types.TRIPLE : types.MUSTACHE };

		// Determine mustache type
		if ( !isTriple ) {
			// We need to test for expressions before we test for mustache type, because
			// an expression that begins '!' looks a lot like a comment
			if ( expr = tokenizer.getExpression() ) {
				mustache.mustacheType = types.INTERPOLATOR;

				// Was it actually an expression, or a comment block in disguise?
				tokenizer.allowWhitespace();

				if ( tokenizer.getStringMatch( tokenizer.delimiters[1] ) ) {
					// expression
					tokenizer.pos -= tokenizer.delimiters[1].length;
				} else {
					// comment block
					tokenizer.pos = start;
					expr = null;
				}
			}

			if ( !expr ) {
				type = getMustacheType( tokenizer );

				// Special case - ampersand mustaches
				if ( type === types.TRIPLE ) {
					mustache = { type: types.TRIPLE };
				} else {
					mustache.mustacheType = type || types.INTERPOLATOR; // default
				}

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
		}

		if ( !expr ) {
			// allow whitespace
			tokenizer.allowWhitespace();

			// get expression
			expr = tokenizer.getExpression();
		}

		while ( expr.t === types.BRACKETED && expr.x ) {
			expr = expr.x;
		}

		// special case - integers should be treated as array members references,
		// rather than as expressions in their own right
		if ( expr.t === types.REFERENCE ) {
			mustache.ref = expr.n;
		} else if ( expr.t === types.NUMBER_LITERAL && arrayMember.test( expr.v ) ) {
			mustache.ref = expr.v;
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