import { INLINE_PARTIAL } from 'config/types';
import readClosing from './section/readClosing';

var partialDefinitionSectionPattern = /^#\s*partial\s+/;

export default function readPartialDefinitionSection ( parser, tag ) {
	var start, name, content, child, closed;

	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
		return null;
	}

	start = parser.pos;

	name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-]*/ );

	if ( !name ) {
		parser.error( 'expected legal partial name' );
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	content = [];

	do {
		if ( child = readClosing( parser, tag ) ) {
			if ( !child.r === 'partial' ) {
				parser.error( `Expected ${tag.open}/partial${tag.close}` );
			}

			closed = true;
		}

		else {
			child = parser.read();

			if ( !child ) {
				parser.error( `Expected ${tag.open}/partial${tag.close}` );
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