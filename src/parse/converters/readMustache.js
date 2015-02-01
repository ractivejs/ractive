import { DELIMCHANGE, SECTION, INVERTED } from 'config/types';
import readDelimiterChange from './mustache/readDelimiterChange';

var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

export default getMustache;

function getMustache ( parser ) {
	var mustache, i;

	// If we're inside a <script> or <style> tag, and we're not
	// interpolating, bug out
	if ( parser.interpolate[ parser.inside ] === false ) {
		return null;
	}

	for ( i = 0; i < parser.delimiters.length; i += 1 ) {
		if ( mustache = getMustacheOfType( parser, parser.delimiters[i] ) ) {
			return mustache;
		}
	}
}

function getMustacheOfType ( parser, delimiters ) {
	var start, mustache, reader, i;

	start = parser.pos;

	if ( !parser.matchString( delimiters.content[0] ) ) {
		return null;
	}

	// delimiter change?
	if ( mustache = readDelimiterChange( parser ) ) {
		// find closing delimiter or abort...
		if ( !parser.matchString( delimiters.content[1] ) ) {
			return null;
		}

		// ...then make the switch
		delimiters.content = mustache;
		parser.sortDelimiters();

		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	// illegal section closer
	if ( parser.matchString( '/' ) ) {
		parser.pos -= ( delimiters.content[1].length + 1 );
		parser.error( 'Attempted to close a section that wasn\'t open' );
	}

	// TEMP should be no if statement - should all be done this way
	if ( delimiters.readers ) {
		for ( i = 0; i < delimiters.readers.length; i += 1 ) {
			reader = delimiters.readers[i];

			if ( mustache = reader( parser, delimiters ) ) {
				if ( delimiters.isStatic ) {
					mustache.s = true; // TODO make this `1` instead - more compact
				}

				if ( parser.includeLinePositions ) {
					mustache.p = parser.getLinePos( start );
				}

				return mustache;
			}
		}

		parser.pos = start;
		return null;
	}

	/*mustache = readMustacheContent( parser, delimiters );

	if ( mustache === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace before closing delimiter
	parser.allowWhitespace();

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( 'Expected closing delimiter \'' + delimiters.content[1] + '\' after reference' );
	}

	if ( mustache.t === COMMENT ) {
		mustache.exclude = true;
	}

	if ( mustache.t === CLOSING ) {
		parser.sectionDepth -= 1;

		if ( parser.sectionDepth < 0 ) {
			parser.pos = start;
			parser.error( 'Attempted to close a section that wasn\'t open' );
		}
	}

	// partials with context
	if ( mustache.contextPartialExpression ) {
		mustache.f = mustache.contextPartialExpression;
		mustache.t = SECTION;
		mustache.n = 'with';

		delete mustache.contextPartialExpression;
	}

	// section children
	else if ( isSection( mustache ) ) {
		parser.sectionDepth += 1;
		children = [];
		currentChildren = children;

		expectedClose = mustache.n;

		while ( child = parser.read() ) {
			if ( child.t === CLOSING ) {
				if ( expectedClose && child.r !== expectedClose ) {
					parser.error( 'Expected {{/' + expectedClose + '}}' );
				}
				break;
			}

			// {{else}} tags require special treatment
			if ( child.t === INTERPOLATOR && child.r === 'else' ) {
				// no {{else}} allowed in {{#unless}}
				if ( mustache.n === 'unless' ) {
					parser.error( '{{else}} not allowed in {{#unless}}' );
				}
				// begin else children
				else {
					currentChildren = elseChildren = [];
					continue;
				}
			}

			currentChildren.push( child );
		}

		if ( children.length ) {
			mustache.f = children;
		}

		if ( elseChildren && elseChildren.length ) {
			mustache.l = elseChildren;
			if( mustache.n === 'with' ) {
				mustache.n = 'if-with';
			}
		}
	}

	if ( parser.includeLinePositions ) {
		mustache.p = parser.getLinePos( start );
	}

	// Replace block name with code
	if ( mustache.n ) {
		mustache.n = handlebarsBlockCodes[ mustache.n ];
	} else if ( mustache.t === INVERTED ) {
		mustache.t = SECTION;
		mustache.n = SECTION_UNLESS;
	}

	// special case inline partial section
	if ( mustache.n === SECTION_PARTIAL ) {
		if ( !mustache.r || mustache.r.indexOf( '.' ) !== -1 ) {
			parser.error( 'Invalid partial name ' + mustache.r + '.' );
		}

		return {
			n: mustache.r,
			f: mustache.f,
			t: INLINE_PARTIAL
		};
	}

	return mustache;*/
}

// function isSection ( mustache ) {
// 	return mustache.t === SECTION || mustache.t === INVERTED;
// }
