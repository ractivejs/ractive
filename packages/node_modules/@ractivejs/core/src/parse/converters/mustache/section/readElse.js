import { ELSE } from '../../../../config/types';

const elsePattern = /^\s*else\s*/;

export default function readElse ( parser, tag ) {
	const start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern ) ) {
		parser.pos = start;
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return {
		t: ELSE
	};
}