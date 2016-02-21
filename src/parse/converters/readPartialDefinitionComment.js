import { INLINE_PARTIAL } from '../../constants/types';
import { warnOnceIfDebug } from '../../utils/log';
import { READERS } from '../_parse';
import escapeRegExp from '../../utils/escapeRegExp';

export default readPartialDefinitionComment;

const startPattern = /^<!--\s*/;
const namePattern = /s*>\s*([a-zA-Z_$][-a-zA-Z_$0-9]*)\s*/;
const finishPattern = /\s*-->/;

function readPartialDefinitionComment ( parser ) {
	const start = parser.pos;
	const open = parser.standardDelimiters[0];
	const close = parser.standardDelimiters[1];

	if ( !parser.matchPattern( startPattern ) || !parser.matchString( open ) ) {
		parser.pos = start;
		return null;
	}

	let name = parser.matchPattern( namePattern );

	warnOnceIfDebug( `Inline partial comments are deprecated.
Use this...
  {{#partial ${name}}} ... {{/partial}}

...instead of this:
  <!-- {{>${name}}} --> ... <!-- {{/${name}}} -->'` );

	// make sure the rest of the comment is in the correct place
	if ( !parser.matchString( close ) || !parser.matchPattern( finishPattern ) ) {
		parser.pos = start;
		return null;
	}

	let content = [];
	let closed;

	let endPattern = new RegExp('^<!--\\s*' + escapeRegExp( open ) + '\\s*\\/\\s*' + name + '\\s*' + escapeRegExp( close ) + '\\s*-->');

	do {
		if ( parser.matchPattern( endPattern ) ) {
			closed = true;
		}

		else {
			const child = parser.read( READERS );
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
