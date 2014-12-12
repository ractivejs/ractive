import { TRIPLE, INTERPOLATOR, COMMENT, SECTION, CLOSING, PARTIAL, REFERENCE, BRACKETED, NUMBER_LITERAL, MEMBER, REFINEMENT } from 'config/types';
import mustacheType from './type';
import handlebarsBlockCodes from './handlebarsBlockCodes';
import 'legacy';

var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	arrayMemberPattern = /^[0-9][1-9]*$/,
	handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' ),
	legalReference;

legalReference = /^[a-zA-Z$_0-9]+(?:(\.[a-zA-Z$_0-9]+)|(\[[a-zA-Z$_0-9]+\]))*$/;

export default function ( parser, delimiterType ) {
	var start, pos, mustache, type, block, expression, i, remaining, index, delimiters, relaxed;

	start = parser.pos;

	mustache = {};

	delimiters = parser[ delimiterType.delimiters ];

	if ( delimiterType.isStatic ) {
		mustache.s = true;
	}

	// Determine mustache type
	if ( delimiterType.isTriple ) {
		mustache.t = TRIPLE;
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
					mustache.t = INTERPOLATOR;
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
					t: COMMENT
				};
			}
		}

		if ( !expression ) {
			type = mustacheType( parser );

			mustache.t = type || INTERPOLATOR; // default

			// See if there's an explicit section type e.g. {{#with}}...{{/with}}
			if ( type === SECTION ) {
				if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
					mustache.n = block;
				}

				parser.allowWhitespace();
			}

			// if it's a comment or a section closer, allow any contents except '}}'
			else if ( type === COMMENT || type === CLOSING ) {
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

		// if this is a partial, we can relax the naming requirements for the expression
		if ( type === PARTIAL ) {
			relaxed = parser.relaxedNames;
			parser.relaxedNames = true;
			expression = parser.readExpression();
			parser.relaxedNames = relaxed;
		}

		// look for named yields
		else if ( mustache.t === INTERPOLATOR && parser.matchString( 'yield ' ) ) {
			parser.allowWhitespace();
			mustache.r = 'yield';
			relaxed = parser.relaxedNames;
			parser.relaxedNames = true;
			expression = parser.readExpression();
			parser.relaxedNames = false;

			if ( expression && expression.t === REFERENCE ) {
				mustache.yn = expression.n;
				expression = null;
			} else if ( expression ) {
				parser.error( 'Only names are supported with yield.' );
			}
		}

		// relax naming for inline partial section
		else if ( mustache.t === SECTION && mustache.n === 'partial' ) {
			relaxed = parser.relaxedNames;
			parser.relaxedNames = true;
			expression = parser.readExpression();
			parser.relaxedNames = false;
		}

		// otherwise, just get an expression
		else {
			// get expression
			expression = parser.readExpression();
		}

		// If this is a partial, it may have a context (e.g. `{{>item foo}}`). These
		// cases involve a bit of a hack - we want to turn it into the equivalent of
		// `{{#with foo}}{{>item}}{{/with}}`, but to get there we temporarily append
		// a 'contextPartialExpression' to the mustache, and process the context instead of
		// the reference
		let temp;
		if ( mustache.t === PARTIAL && expression && ( temp = parser.readExpression() ) ) {
			mustache = {
				contextPartialExpression: expression
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

	refineExpression( parser, expression, mustache );

	// if there was context, process the expression now and save it for later
	if ( mustache.contextPartialExpression ) {
		mustache.contextPartialExpression = [
			refineExpression( parser, mustache.contextPartialExpression, { t: PARTIAL } )
		];
	}

	// optional index and key references
	if ( i = parser.matchPattern( indexRefPattern ) ) {
		let extra;

		if ( extra = parser.matchPattern( keyIndexRefPattern ) ) {
			mustache.i = i + ',' + extra;
		} else {
			mustache.i = i;
		}
	}

	return mustache;
}

function refineExpression ( parser, expression, mustache ) {
	var referenceExpression;

	if ( expression ) {
		while ( expression.t === BRACKETED && expression.x ) {
			expression = expression.x;
		}

		// special case - integers should be treated as array members references,
		// rather than as expressions in their own right
		if ( expression.t === REFERENCE ) {
			mustache.r = expression.n;
		} else {
			if ( expression.t === NUMBER_LITERAL && arrayMemberPattern.test( expression.v ) ) {
				mustache.r = expression.v;
			} else if ( referenceExpression = getReferenceExpression( parser, expression ) ) {
				mustache.rx = referenceExpression;
			} else {
				mustache.x = parser.flattenExpression( expression );
			}
		}

		return mustache;
	}
}

// TODO refactor this! it's bewildering
function getReferenceExpression ( parser, expression ) {
	var members = [], refinement;

	while ( expression.t === MEMBER && expression.r.t === REFINEMENT ) {
		refinement = expression.r;

		if ( refinement.x ) {
			if ( refinement.x.t === REFERENCE ) {
				members.unshift( refinement.x );
			} else {
				members.unshift( parser.flattenExpression( refinement.x ) );
			}
		} else {
			members.unshift( refinement.n );
		}

		expression = expression.x;
	}

	if ( expression.t !== REFERENCE ) {
		return null;
	}

	return {
		r: expression.n,
		m: members
	};
}
