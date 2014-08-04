import types from 'config/types';
import delimiterChange from 'parse/converters/mustache/delimiterChange';
import delimiterTypes from 'parse/converters/mustache/delimiterTypes';
import mustacheContent from 'parse/converters/mustache/content';
import handlebarsBlockCodes from 'parse/converters/mustache/handlebarsBlockCodes';

var delimiterChangeToken = { t: types.DELIMCHANGE, exclude: true },
	handlebarsIndexRefPattern = /^@(?:index|key)$/;

export default getMustache;

function getMustache ( parser ) {
	var types;

	// If we're inside a <script> or <style> tag, and we're not
	// interpolating, bug out
	if ( parser.interpolate[ parser.inside ] === false ) {
		return null;
	}

	types = delimiterTypes.slice().sort( function compare (a, b) {
		// Sort in order of descending opening delimiter length (longer first),
		// to protect against opening delimiters being substrings of each other
		return parser[ b.delimiters ][ 0 ].length - parser[ a.delimiters ][ 0 ].length;
	} );

	return ( function r ( type ) {
		if ( !type ) {
			return null;
		} else {
			return getMustacheOfType( parser, type ) || r( types.shift() );
		}
	} ( types.shift() ) );
}

function getMustacheOfType ( parser, delimiterType ) {
	var start, startPos, mustache, delimiters, children, expectedClose, elseChildren, currentChildren, child, indexRef;

	start = parser.pos;
	startPos = parser.getLinePos();

	delimiters = parser[ delimiterType.delimiters ];

	if ( !parser.matchString( delimiters[0] ) ) {
		return null;
	}

	// delimiter change?
	if ( mustache = delimiterChange( parser ) ) {
		// find closing delimiter or abort...
		if ( !parser.matchString( delimiters[1] ) ) {
			return null;
		}

		// ...then make the switch
		parser[ delimiterType.delimiters ] = mustache;
		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	mustache = mustacheContent( parser, delimiterType );

	if ( mustache === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace before closing delimiter
	parser.allowWhitespace();

	if ( !parser.matchString( delimiters[1] ) ) {
		parser.error( 'Expected closing delimiter \'' + delimiters[1] + '\' after reference' );
	}

	if ( mustache.t === types.COMMENT ) {
		mustache.exclude = true;
	}

	if ( mustache.t === types.CLOSING ) {
		parser.sectionDepth -= 1;

		if ( parser.sectionDepth < 0 ) {
			parser.pos = start;
			parser.error( 'Attempted to close a section that wasn\'t open' );
		}
	}

	// partials with context
	if ( mustache.contextPartialId ) {
		mustache.f = [{ t: types.PARTIAL, r: mustache.contextPartialId }];
		mustache.t = types.SECTION;
		mustache.n = 'with';

		delete mustache.contextPartialId;
	}

	// section children
	else if ( isSection( mustache ) ) {
		parser.sectionDepth += 1;
		children = [];
		currentChildren = children;

		expectedClose = mustache.n;

		while ( child = parser.read() ) {
			if ( child.t === types.CLOSING ) {
				if ( expectedClose && child.r !== expectedClose ) {
					parser.error( 'Expected {{/' + expectedClose + '}}' );
				}
				break;
			}

			// {{else}} tags require special treatment
			if ( child.t === types.INTERPOLATOR && child.r === 'else' ) {
				switch ( mustache.n ) {
					case 'unless':
						parser.error( '{{else}} not allowed in {{#unless}}' );
						break;

					case 'with':
						parser.error( '{{else}} not allowed in {{#with}}' );
						break;

					default:
						currentChildren = elseChildren = [];
						continue;
				}
			}

			currentChildren.push( child );
		}

		if ( children.length ) {
			mustache.f = children;

			// If this is an 'each' section, and it contains an {{@index}} or {{@key}},
			// we need to set the index reference accordingly
			if ( !mustache.i && mustache.n === 'each' && ( indexRef = handlebarsIndexRef( mustache.f ) ) ) {
				mustache.i = indexRef;
			}
		}

		if ( elseChildren && elseChildren.length ) {
			mustache.l = elseChildren;
		}
	}

	if ( parser.includeLinePositions ) {
		mustache.p = startPos.toJSON();
	}

	// Replace block name with code
	if ( mustache.n ) {
		mustache.n = handlebarsBlockCodes[ mustache.n ];
	} else if ( mustache.t === types.INVERTED ) {
		mustache.t = types.SECTION;
		mustache.n = types.SECTION_UNLESS;
	}

	return mustache;
}

function handlebarsIndexRef ( fragment ) {
	var i, child, indexRef, name;

	if ( !fragment ) {
		return;
	}

	i = fragment.length;
	while ( i-- ) {
		child = fragment[i];

		// Recurse into elements (but not sections)
		if ( child.t === types.ELEMENT ) {

			if ( indexRef =
				// directive arguments
				handlebarsIndexRef( child.o  && child.o.d ) ||
				handlebarsIndexRef( child.t0 && child.t0.d ) ||
				handlebarsIndexRef( child.t1 && child.t1.d ) ||
				handlebarsIndexRef( child.t2 && child.t2.d ) ||

				// children
				handlebarsIndexRef( child.f )
			) {
				return indexRef;
			}

			// proxy events
			for ( name in child.v ) {
				if ( child.v.hasOwnProperty( name ) && child.v[ name ].d && ( indexRef = handlebarsIndexRef( child.v[ name ].d ) ) ) {
					return indexRef;
				}
			}

			// attributes
			for ( name in child.a ) {
				if ( child.a.hasOwnProperty( name ) && ( indexRef = handlebarsIndexRef( child.a[ name ] ) ) ) {
					return indexRef;
				}
			}
		}

		// Mustache?
		if ( child.t === types.INTERPOLATOR || child.t === types.TRIPLE || child.t === types.SECTION ) {
			// Normal reference?
			if ( child.r && handlebarsIndexRefPattern.test( child.r ) ) {
				return child.r;
			}

			// Expression?
			if ( child.x && ( indexRef = indexRefContainedInExpression( child.x ) ) ) {
				return indexRef;
			}

			// Reference expression?
			if ( child.rx && ( indexRef = indexRefContainedInReferenceExpression( child.rx ) ) ) {
				return indexRef;
			}
		}
	}
}

function indexRefContainedInExpression ( expression ) {
	var i;

	i = expression.r.length;
	while ( i-- ) {
		if ( handlebarsIndexRefPattern.test( expression.r[i] ) ) {
			return expression.r[i];
		}
	}
}

function indexRefContainedInReferenceExpression ( referenceExpression ) {
	var i, indexRef, member;

	i = referenceExpression.m.length;
	while ( i-- ) {
		member = referenceExpression.m[i];

		if ( member.r && ( indexRef = indexRefContainedInExpression( member ) ) ) {
			return indexRef;
		}

		if ( member.t === types.REFERENCE && handlebarsIndexRefPattern.test( member.n ) ) {
			return member.n;
		}
	}
}

function isSection ( mustache ) {
	return mustache.t === types.SECTION || mustache.t === types.INVERTED;
}
