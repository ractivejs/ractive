import types from 'config/types';
import delimiterChange from 'parse/converters/mustache/delimiterChange';
import delimiterTypes from 'parse/converters/mustache/delimiterTypes';
import mustacheContent from 'parse/converters/mustache/content';

var delimiterChangeToken = { t: types.DELIMCHANGE, exclude: true },
	handlebarsIndexRefPattern = /^@(?:index|key)$/;

export default getMustache;

function getMustache ( parser ) {
	var types;

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

	// section children
	if ( mustache.t === types.SECTION ) {
		children = [];
		currentChildren = children;

		if ( parser.options.strict || parser.handlebars ) {
			switch ( mustache.n ) {
				case types.SECTION_IF:
					expectedClose = 'if';
					break;
				case types.SECTION_EACH:
					expectedClose = 'each';
					break;
				case types.SECTION_UNLESS:
					expectedClose = 'unless';
					break;
				case types.SECTION_WITH:
					expectedClose = 'with';
					break;
			}
		}

		while ( child = parser.read() ) {
			if ( child.t === types.CLOSING ) {
				if (expectedClose && child.r !== expectedClose) {
					parser.error( 'Expected {{/' + expectedClose + '}}' );
				}
				break;
			}

			if ( parser.handlebars && child.t === types.INTERPOLATOR && child.r === 'else' ) {
				switch ( mustache.n ) {
					case types.SECTION_IF:
					case types.SECTION_EACH:
						currentChildren = elseChildren = [];
						continue; // don't add this item to children

					case types.SECTION_UNLESS:
						parser.error( '{{else}} not allowed in {{#unless}}' );
						break;

					case types.SECTION_WITH:
						parser.error( '{{else}} not allowed in {{#with}}' );
						break;
				}
			}

			currentChildren.push( child );
		}

		if ( children.length ) {
			mustache.f = children;

			// If this is an 'each' section, and it contains an {{@index}} or {{@key}},
			// we need to set the index reference accordingly
			if ( !mustache.i && mustache.n === types.SECTION_EACH && ( indexRef = handlebarsIndexRef( mustache.f ) ) ) {
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

	return mustache;
}

function handlebarsIndexRef ( fragment ) {
	var i, child, indexRef;

	i = fragment.length;
	while ( i-- ) {
		child = fragment[i];

		// Recurse into elements (but not sections)
		if ( child.t === types.ELEMENT && child.f && ( indexRef = handlebarsIndexRef( child.f ) ) ) {
			return indexRef;
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
