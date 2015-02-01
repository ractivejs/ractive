import { SECTION, ELSE, SECTION_UNLESS } from 'config/types';
import readClosing from './section/readClosing';
import readElse from './section/readElse';
import handlebarsBlockCodes from './handlebarsBlockCodes';
import readExpression from 'parse/converters/readExpression';
import refineExpression from 'parse/utils/refineExpression';

var ELSEIF = {}; // TODO...

var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	handlebarsBlockPattern = new RegExp( '^(' + Object.keys( handlebarsBlockCodes ).join( '|' ) + ')\\b' ),
	legalReference;

export default function readSection ( parser, delimiters ) {
	var start, expression, section, child, children, hasElse, block, elseBlocks, closed, i, expectedClose;

	start = parser.pos;

	if ( parser.matchString( '^' ) ) {
		section = { t: SECTION, f: [], n: SECTION_UNLESS };
	} else if ( parser.matchString( '#' ) ) {
		section = { t: SECTION, f: [] };

		if ( block = parser.matchPattern( handlebarsBlockPattern ) ) {
			expectedClose = block;
			section.n = handlebarsBlockCodes[ block ];
		}
	} else {
		return null;
	}

	parser.allowWhitespace();

	expression = readExpression( parser );

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

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
	}

	parser.sectionDepth += 1;
	children = section.f;

	do {
		if ( child = readClosing( parser, delimiters ) ) {
			if ( expectedClose && child.r !== expectedClose ) {
				parser.error( `Expected ${delimiters.content[0]}/${expectedClose}${delimiters.content[1]}` );
			}

			parser.sectionDepth -= 1;
			closed = true;
		}

		// TODO or elseif
		else if ( child = readElse( parser, delimiters ) ) {
			if ( section.n === SECTION_UNLESS ) {
				parser.error( '{{else}} not allowed in {{#unless}}' );
			}

			if ( hasElse ) {
				parser.error( 'there can only be one {{else}} block, at the end of a section' );
			}

			if ( child.t === ELSE ) {
				hasElse = true;
				/*block = {
					t: ELSE,
					f: ( children = [] )
				};*/
				elseBlocks = children = [];
			} else {
				throw new Error( 'elseif not yet implemented' );
				block = {
					t: ELSEIF,
					x: child.x,
					f: ( children = [] )
				};
			}

			//( elseBlocks || ( elseBlocks = [] ) ).push( block );
		}

		else {
			child = parser.read();

			if ( !child ) {
				break;
			}

			children.push( child );
		}
	} while ( !closed );

	if ( elseBlocks ) {
		section.l = elseBlocks;
		console.log( 'section', JSON.parse(JSON.stringify(section)) );
	}

	refineExpression( expression, section );

	// TODO if a section is empty it should be discarded. Don't do
	// that here though - we need to clean everything up first, as
	// it may contain removeable whitespace. As a temporary measure,
	// to pass the existing tests, remove empty `f` arrays
	if ( !section.f.length ) {
		delete section.f;
	}

	return section;
}