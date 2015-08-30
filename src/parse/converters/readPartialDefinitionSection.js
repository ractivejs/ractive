import { INLINE_PARTIAL } from '../../config/types';
import { READERS } from '../_parse';
import readClosing from './mustache/section/readClosing';

var partialDefinitionSectionPattern = /^#\s*partial\s+/;

export default function readPartialDefinitionSection ( parser ) {
	var start, name, content, child, closed;

	start = parser.pos;

	let delimiters = parser.standardDelimiters;

	if ( !parser.matchString( delimiters[0] ) ) {
		return null;
	}

	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
		parser.pos = start;
		return null;
	}

	name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/ );

	if ( !name ) {
		parser.error( 'expected legal partial name' );
	}

	if ( !parser.matchString( delimiters[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters[1]}'` );
	}

	content = [];

	do {
		// TODO clean this up
		if ( child = readClosing( parser, { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] }) ) {
			if ( !child.r === 'partial' ) {
				parser.error( `Expected ${delimiters[0]}/partial${delimiters[1]}` );
			}

			closed = true;
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				parser.error( `Expected ${delimiters[0]}/partial${delimiters[1]}` );
			}

			content.push( child );
		}
	} while ( !closed );

	return {
		t: INLINE_PARTIAL,
		n: name,
		f: content
	};
}
