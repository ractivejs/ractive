import types from 'config/types';
import delimiterChange from 'parse/converters/mustache/delimiterChange';
import mustacheContent from 'parse/converters/mustache/content';

var delimiterChangeToken = { t: types.DELIMCHANGE, exclude: true },
	handlebarsIndexRefPattern = /^@(?:index|key)$/;

export default getMustache;

function getMustache ( parser ) {
	// if the triple delimiter (e.g. '{{{') is longer than the regular mustache
	// delimiter (e.g. '{{') then we need to try and find a triple first. Otherwise
	// we will get a false positive if the mustache delimiter is a substring of the
	// triple delimiter, as in the default case
	var seekTripleFirst = ( parser.tripleDelimiters[0].length > parser.delimiters[0].length );
	return getMustacheOrTriple( parser, seekTripleFirst ) || getMustacheOrTriple( parser, !seekTripleFirst );
}

function getMustacheOrTriple ( parser, seekTriple ) {
	var start, startPos, mustache, delimiters, children, expectedClose, elseChildren, currentChildren, child, indexRef;

	start = parser.pos;
	startPos = parser.getLinePos();

	delimiters = ( seekTriple ? parser.tripleDelimiters : parser.delimiters );

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
		parser[ seekTriple ? 'tripleDelimiters' : 'delimiters' ] = mustache;
		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	mustache = mustacheContent( parser, seekTriple );

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

		if (parser.options.strict || parser.handlebars) {
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
