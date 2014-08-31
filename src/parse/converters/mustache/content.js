import types from 'config/types';
import mustacheType from 'parse/converters/mustache/type';
import handlebarsBlockCodes from 'parse/converters/mustache/handlebarsBlockCodes';
import 'legacy';

var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	arrayMemberPattern = /^[0-9][1-9]*$/,
	handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' ),
	legalReference;

legalReference = /^[a-zA-Z$_0-9]+(?:(\.[a-zA-Z$_0-9]+)|(\[[a-zA-Z$_0-9]+\]))*$/;

export default function ( parser, delimiterType ) {
	var start, pos, mustache, type, block, expression, i, remaining, index, delimiters, referenceExpression;

	start = parser.pos;

	mustache = {};

	delimiters = parser[ delimiterType.delimiters ];

	if ( delimiterType.isStatic ) {
		mustache.s = true;
	}

	// Determine mustache type
	if ( delimiterType.isTriple ) {
		mustache.t = types.TRIPLE;
	} else {
		// We need to test for expressions before we test for mustache type, because
		// an expression that begins '!' looks a lot like a comment
		if ( parser.remaining()[0] === '!' ) {
			try {
				expression = parser.readExpression();

				// Was it actually an expression, or a comment block in disguise?
				parser.allowWhitespace();
				if ( parser.remaining().indexOf( delimiters[1] ) ) {
					expression = null;
				} else {
					mustache.t = types.INTERPOLATOR;
				}
			} catch ( err ) {}

			if ( !expression ) {
				index = parser.remaining().indexOf( delimiters[1] );

				if ( ~index ) {
					parser.pos += index;
				} else {
					parser.error( 'Expected closing delimiter (\'' + delimiters[1] + '\')' );
				}

				return {
					t: types.COMMENT
				};
			}
		}

		if ( !expression ) {
			type = mustacheType( parser );

			mustache.t = type || types.INTERPOLATOR; // default

			// See if there's an explicit section type e.g. {{#with}}...{{/with}}
			if ( type === types.SECTION ) {
				if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
					mustache.n = block;
				}

				parser.allowWhitespace();
			}

			// if it's a comment or a section closer, allow any contents except '}}'
			else if ( type === types.COMMENT || type === types.CLOSING ) {
				remaining = parser.remaining();
				index = remaining.indexOf( delimiters[1] );

				if ( index !== -1 ) {
					mustache.r = remaining.substr( 0, index ).split( ' ' )[0];
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

		// If this is a partial, it may have a context (e.g. `{{>item foo}}`). These
		// cases involve a bit of a hack - we want to turn it into the equivalent of
		// `{{#with foo}}{{>item}}{{/with}}`, but to get there we temporarily append
		// a 'contextPartialId' to the mustache, and process the context instead of
		// the reference
		let temp;
		if ( mustache.t === types.PARTIAL && ( expression.t === types.REFERENCE ) && ( temp = parser.readExpression() ) ) {
			mustache = {
				contextPartialId: expression.n
			};

			expression = temp;
		}

		// With certain valid references that aren't valid expressions,
		// e.g. {{1.foo}}, we have a problem: it looks like we've got an
		// expression, but the expression didn't consume the entire
		// reference. So we need to check that the mustache delimiters
		// appear next, unless there's an index reference (i.e. a colon)
		remaining = parser.remaining();

		if ( ( remaining.substr( 0, delimiters[1].length ) !== delimiters[1] ) && ( remaining.charAt( 0 ) !== ':' ) ) {
			pos = parser.pos;
			parser.pos = start;

			remaining = parser.remaining();
			index = remaining.indexOf( delimiters[1] );

			if ( index !== -1 ) {
				mustache.r = remaining.substr( 0, index ).trim();

				// Check it's a legal reference
				if ( !legalReference.test( mustache.r ) ) {
					parser.error( 'Expected a legal Mustache reference' );
				}

				parser.pos += index;
				return mustache;
			}

			parser.pos = pos; // reset, so we get more informative error messages
		}
	}

	if ( expression ) {
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
			} else if ( referenceExpression = getReferenceExpression( parser, expression ) ) {
				mustache.rx = referenceExpression;
			} else {
				mustache.x = parser.flattenExpression( expression );
			}
		}
	}

	// optional index reference
	if ( i = parser.matchPattern( indexRefPattern ) ) {
		mustache.i = i;
	}

	return mustache;
}

// TODO refactor this! it's bewildering
function getReferenceExpression ( parser, expression ) {
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
