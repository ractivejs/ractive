import { COMMENT } from '../../../config/types';

export default function readComment ( parser, tag ) {
	if ( !parser.matchString( '!' ) ) {
		return null;
	}

	const index = parser.remaining().indexOf( tag.close );

	if ( index !== -1 ) {
		parser.pos += index + tag.close.length;
		return { t: COMMENT };
	}
}
