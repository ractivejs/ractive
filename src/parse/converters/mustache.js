import { DELIMCHANGE, COMMENT, CLOSING, SECTION, INTERPOLATOR, INVERTED, SECTION_UNLESS, SECTION_PARTIAL, INLINE_PARTIAL } from 'config/types';
import delimiterChange from './mustache/delimiterChange';
import delimiterTypes from './mustache/delimiterTypes';
import mustacheContent from './mustache/content';
import handlebarsBlockCodes from './mustache/handlebarsBlockCodes';

var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

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
	var start, mustache, delimiters, children, expectedClose, elseBlocks, currentChildren, child;

	start = parser.pos;

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
			if ( child.t === INTERPOLATOR ) {
				if ( child.r === 'else' ) {
					// no {{else}} allowed in {{#unless}}
					if ( mustache.n === 'unless' ) {
						parser.error( '{{else}} not allowed in {{#unless}}' );
					}

					// begin else children
					else {
						if ( !elseBlocks ) {
							elseBlocks = [];
						}

						currentChildren = [];
						elseBlocks.push( currentChildren );
						continue;
					}
				}

				else if ( child.x && child.x.r[0] === 'elseif' ) {
					if ( !elseBlocks ) {
						elseBlocks = [];
					}

					currentChildren = [];
					elseBlocks.push( currentChildren );
					currentChildren.expression = child.x;
					child.x.r.shift();
					child.x.s = child.x.s.substring( 3, child.x.s.length - 1 );

					let i = child.x.r.length + 1;
					while ( i-- > 1 ) {
						child.x.s = child.x.s.replace( '_' + i, '_' + ( i - 1) );
					}
					continue;
				}
			}

			currentChildren.push( child );
		}

		if ( children.length ) {
			mustache.f = children;
		}

		if ( elseBlocks && elseBlocks.length ) {
			mustache.l = elseBlocks;
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

	return mustache;
}

function isSection ( mustache ) {
	return mustache.t === SECTION || mustache.t === INVERTED;
}
