import { SECTION, INVERTED, CLOSING, PARTIAL, COMMENT, TRIPLE } from '../../../config/types';

const mustacheTypes = {
	'#': SECTION,
	'^': INVERTED,
	'/': CLOSING,
	'>': PARTIAL,
	'!': COMMENT,
	'&': TRIPLE
};

export default function ( parser ) {
	const type = mustacheTypes[ parser.nextChar() ];

	if ( !type ) {
		return null;
	}

	parser.pos += 1;
	return type;
}
