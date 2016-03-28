import { ALIAS, SECTION, SECTION_IF, SECTION_UNLESS, PREFIX_OPERATOR, INFIX_OPERATOR, BRACKETED } from '../../../config/types';
import { READERS } from '../../_parse';
import readClosing from './section/readClosing';
import readElse from './section/readElse';
import readElseIf from './section/readElseIf';
import handlebarsBlockCodes from './handlebarsBlockCodes';
import readExpression from '../readExpression';
import flattenExpression from '../../utils/flattenExpression';
import refineExpression from '../../utils/refineExpression';
import { readAlias, readAliases } from './readAliases';

var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' );

export default function readSection ( parser, tag ) {
	var start, expression, section, child, children, hasElse, block, unlessBlock, conditions, closed, i, expectedClose, aliasOnly = false;

	start = parser.pos;

	if ( parser.matchString( '^' ) ) {
		section = { t: SECTION, f: [], n: SECTION_UNLESS };
	} else if ( parser.matchString( '#' ) ) {
		section = { t: SECTION, f: [] };

		if ( parser.matchString( 'partial' ) ) {
			parser.pos = start - parser.standardDelimiters[0].length;
			parser.error( 'Partial definitions can only be at the top level of the template, or immediately inside components' );
		}

		if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
			expectedClose = block;
			section.n = handlebarsBlockCodes[ block ];
		}
	} else {
		return null;
	}

	parser.allowWhitespace();

	if ( block === 'with' ) {
		let aliases = readAliases( parser );
		if ( aliases ) {
			aliasOnly = true;
			section.z = aliases;
			section.t = ALIAS;
		}
	} else if ( block === 'each' ) {
		let alias = readAlias( parser );
		if ( alias ) {
			section.z = [ { n: alias.n, x: { r: '.' } } ];
			expression = alias.x;
		}
	}

	if ( !aliasOnly ) {
		if ( !expression ) expression = readExpression( parser );

		if ( !expression ) {
			parser.error( 'Expected expression' );
		}

		// optional index and key references
		if ( i = parser.matchPattern( indexRefPattern ) ) {
			let extra;

			if ( extra = parser.matchPattern( keyIndexRefPattern ) ) {
				section.i = i + ',' + extra;
			} else {
				section.i = i;
			}
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	parser.sectionDepth += 1;
	children = section.f;

	conditions = [];

	do {
		if ( child = readClosing( parser, tag ) ) {
			if ( expectedClose && child.r !== expectedClose ) {
				parser.error( `Expected ${tag.open}/${expectedClose}${tag.close}` );
			}

			parser.sectionDepth -= 1;
			closed = true;
		}

		else if ( !aliasOnly && ( child = readElseIf( parser, tag ) ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'illegal {{elseif...}} after {{else}}' );
			}

			if ( !unlessBlock ) {
				unlessBlock = createUnlessBlock( expression );
			}

			unlessBlock.f.push({
				t: SECTION,
				n: SECTION_IF,
				x: flattenExpression( combine( conditions.concat( child.x ) ) ),
				f: children = []
			});

			conditions.push( invert( child.x ) );
		}

		else if ( !aliasOnly && ( child = readElse( parser, tag ) ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'there can only be one {{else}} block, at the end of a section' );
			}

			hasElse = true;

			// use an unless block if there's no elseif
			if ( !unlessBlock ) {
				unlessBlock = createUnlessBlock( expression );
				children = unlessBlock.f;
			} else {
				unlessBlock.f.push({
					t: SECTION,
					n: SECTION_IF,
					x: flattenExpression( combine( conditions ) ),
					f: children = []
				});
			}
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				break;
			}

			children.push( child );
		}
	} while ( !closed );

	if ( unlessBlock ) {
		section.l = unlessBlock;
	}

	if ( !aliasOnly ) {
		refineExpression( expression, section );
	}

	// TODO if a section is empty it should be discarded. Don't do
	// that here though - we need to clean everything up first, as
	// it may contain removeable whitespace. As a temporary measure,
	// to pass the existing tests, remove empty `f` arrays
	if ( !section.f.length ) {
		delete section.f;
	}

	return section;
}

function createUnlessBlock ( expression ) {
	let unlessBlock = {
		t: SECTION,
		n: SECTION_UNLESS,
		f: []
	};

	refineExpression( expression, unlessBlock );
	return unlessBlock;
}

function invert ( expression ) {
	if ( expression.t === PREFIX_OPERATOR && expression.s === '!' ) {
		return expression.o;
	}

	return {
		t: PREFIX_OPERATOR,
		s: '!',
		o: parensIfNecessary( expression )
	};
}

function combine ( expressions ) {
	if ( expressions.length === 1 ) {
		return expressions[0];
	}

	return {
		t: INFIX_OPERATOR,
		s: '&&',
		o: [
			parensIfNecessary( expressions[0] ),
			parensIfNecessary( combine( expressions.slice( 1 ) ) )
		]
	};
}

function parensIfNecessary ( expression ) {
	// TODO only wrap if necessary
	return {
		t: BRACKETED,
		x: expression
	};
}
