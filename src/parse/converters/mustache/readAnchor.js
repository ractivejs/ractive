import { ANCHOR } from '../../../config/types';

const namePattern = /[-a-zA-Z0-9_$#]+/;

export default function readPartial ( parser, tag ) {
	if ( !parser.matchString( '>>' ) ) return null;

	parser.allowWhitespace();

	let multi = false;
	const name = parser.matchPattern( namePattern );

	if ( !name ) parser.error( `Expected a valid anchor name.` );

	parser.allowWhitespace();

	if ( parser.matchString( 'multi' ) ) multi = true;

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return {
		t: ANCHOR,
		n: name,
		m: multi
	};
}

