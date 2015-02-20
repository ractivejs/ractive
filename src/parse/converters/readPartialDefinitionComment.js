import { INLINE_PARTIAL } from 'config/types';
import escapeRegExp from 'utils/escapeRegExp';

export default readPartialDefinitionComment;

var startPattern = /^<!--\s*/,
    namePattern = /s*>\s*([a-zA-Z_$][-a-zA-Z_$0-9]*)\s*/,
    finishPattern = /\s*-->/,
    child;

function readPartialDefinitionComment ( parser ) {
	let firstPos = parser.pos,
	    open = parser.standardDelimiters[0],
	    close = parser.standardDelimiters[1],
	    content,
	    closed;

	if ( !parser.matchPattern( startPattern ) || !parser.matchString( open ) ) {
		parser.pos = firstPos;
		return null;
	}

	let name = parser.matchPattern( namePattern );

	// make sure the rest of the comment is in the correct place
	if ( !parser.matchString( close ) || !parser.matchPattern( finishPattern ) ) {
		parser.pos = firstPos;
		return null;
	}

	content = [];

	let endPattern = new RegExp('^<!--\\s*' + escapeRegExp( open ) + '\\s*\\/\\s*' + name + '\\s*' + escapeRegExp( close ) + '\\s*-->');

	do {
		if ( parser.matchPattern( endPattern ) ) {
			closed = true;
		}

		else {
			child = parser.read();
			if ( !child ) {
				parser.error( `expected closing comment ('<!-- ${open}/${name}${close} -->')` );
			}

			content.push( child );
		}
	} while ( !closed );

	return {
		t: INLINE_PARTIAL,
		f: content,
		n: name
	};
}
