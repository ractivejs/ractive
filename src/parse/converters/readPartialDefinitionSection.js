import { INLINE_PARTIAL } from '../../config/types';
import { READERS } from '../_parse';
import readClosing from './mustache/section/readClosing';

const partialDefinitionSectionPattern = /^\s*#\s*partial\s+/;

export default function readPartialDefinitionSection ( parser ) {
	let child, closed;

	const start = parser.pos;

	const delimiters = parser.standardDelimiters;

	if ( !parser.matchString( delimiters[0] ) ) {
		return null;
	}

	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
		parser.pos = start;
		return null;
	}

	const name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/ );

	if ( !name ) {
		parser.error( 'expected legal partial name' );
	}

	parser.allowWhitespace();
	if ( !parser.matchString( delimiters[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters[1]}'` );
	}

	const content = [];

	const [ open, close ] = delimiters;

	do {
		if ( child = readClosing( parser, { open, close }) ) {
			if ( child.r !== 'partial' ) {
				parser.error( `Expected ${open}/partial${close}` );
			}

			closed = true;
		}

		else {
			child = parser.read( READERS );

			if ( !child ) {
				parser.error( `Expected ${open}/partial${close}` );
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
