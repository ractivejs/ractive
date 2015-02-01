import { INLINE_PARTIAL } from 'config/types';
import readClosing from './section/readClosing';

var partialDefinitionSectionPattern = /^#\s*partial\s+/;

export default function readPartialDefinitionSection ( parser, delimiters ) {
	var start, name, content, child, closed;

	if ( !parser.matchPattern( partialDefinitionSectionPattern ) ) {
		return null;
	}

	start = parser.pos;

	name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );

	if ( !name ) {
		parser.error( 'expected legal partial name' );
	}

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
	}

	content = [];

	do {
		if ( child = readClosing( parser, delimiters ) ) {
			if ( !child.r === 'partial' ) {
				parser.error( `Expected ${delimiters.content[0]}/partial${delimiters.content[1]}` );
			}

			closed = true;
		}

		else {
			child = parser.read();

			if ( !child ) {
				parser.error( `Expected ${delimiters.content[0]}/partial${delimiters.content[1]}` );
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