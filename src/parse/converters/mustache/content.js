define([
	'config/types',
	'parse/converters/mustache/type'
], function (
	types,
	mustacheType
) {

	'use strict';

	var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
		arrayMemberPattern = /^[0-9][1-9]*$/;

	return function ( parser, isTriple ) {
		var start, pos, mustache, type, expression, i, remaining, index, delimiter, keypathExpression;

		start = parser.pos;

		mustache = {};

		// Determine mustache type
		if ( isTriple ) {
			mustache.t = types.TRIPLE;
		} else {
			// We need to test for expressions before we test for mustache type, because
			// an expression that begins '!' looks a lot like a comment
			if ( expression = parser.readExpression() ) {
				mustache.t = types.INTERPOLATOR;

				// Was it actually an expression, or a comment block in disguise?
				parser.allowWhitespace();

				if ( parser.matchString( parser.delimiters[1] ) ) {
					// expression
					parser.pos -= parser.delimiters[1].length;
				} else {
					// comment block
					parser.pos = start;
					expression = null;
				}
			}

			if ( !expression ) {
				type = mustacheType( parser );

				mustache.t = type || types.INTERPOLATOR; // default

				// TODO handle this more logically
				if ( mustache.t === types.INVERTED ) {
					mustache.t = types.SECTION;
					mustache.n = 1;
				}

				// if it's a comment or a section closer, allow any contents except '}}'
				if ( type === types.COMMENT || type === types.CLOSING ) {
					remaining = parser.remaining();
					index = remaining.indexOf( parser.delimiters[1] );

					if ( index !== -1 ) {
						mustache.r = remaining.substr( 0, index );
						parser.pos += index;
						return mustache;
					}
				}
			}
		}

		if ( !expression ) {
			// allow whitespace
			parser.allowWhitespace();

			// get expression
			expression = parser.readExpression();

			// With certain valid references that aren't valid expressions,
			// e.g. {{1.foo}}, we have a problem: it looks like we've got an
			// expression, but the expression didn't consume the entire
			// reference. So we need to check that the mustache delimiters
			// appear next, unless there's an index reference (i.e. a colon)
			remaining = parser.remaining();
			delimiter = isTriple ? parser.tripleDelimiters[1] : parser.delimiters[1];

			if ( ( remaining.substr( 0, delimiter.length ) !== delimiter ) && ( remaining.charAt( 0 ) !== ':' ) ) {
				pos = parser.pos;
				parser.pos = start;

				remaining = parser.remaining();
				index = remaining.indexOf( parser.delimiters[1] );

				if ( index !== -1 ) {
					mustache.r = remaining.substr( 0, index ).trim();
					parser.pos += index;
					return mustache;
				}

				parser.pos = pos; // reset, so we get more informative error messages
			}
		}

		while ( expression.t === types.BRACKETED && expression.x ) {
			expression = expression.x;
		}

		// special case - integers should be treated as array members references,
		// rather than as expressions in their own right
		if ( expression.t === types.REFERENCE ) {
			mustache.r = expression.n;
		} else {
			if ( expression.t === types.NUMBER_LITERAL && arrayMemberPattern.test( expression.v ) ) {
				mustache.r = expression.v;
			} else if ( keypathExpression = getKeypathExpression( parser, expression ) ) {
				mustache.kx = keypathExpression;
			} else {
				mustache.x = parser.flattenExpression( expression );
			}
		}

		// optional index reference
		if ( i = parser.matchPattern( indexRefPattern ) ) {
			mustache.i = i;
		}

		return mustache;
	};

	// TODO refactor this! it's bewildering
	function getKeypathExpression ( parser, expression ) {
		var members = [], refinement;

		while ( expression.t === types.MEMBER && expression.r.t === types.REFINEMENT ) {
			refinement = expression.r;

			if ( refinement.x ) {
				if ( refinement.x.t === types.REFERENCE ) {
					members.unshift( refinement.x );
				} else {
					members.unshift( parser.flattenExpression( refinement.x ) );
				}
			} else {
				members.unshift( refinement.n );
			}

			expression = expression.x;
		}

		if ( expression.t !== types.REFERENCE ) {
			return null;
		}

		return {
			r: expression.n,
			m: members
		};
	}

});
