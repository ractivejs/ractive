import { SECTION, INVERTED, CLOSING, PARTIAL, COMMENT, TRIPLE } from '../../../constants/types';

var mustacheTypes = {
	'#': SECTION,
	'^': INVERTED,
	'/': CLOSING,
	'>': PARTIAL,
	'!': COMMENT,
	'&': TRIPLE
};

export default function ( parser ) {
	var type = mustacheTypes[ parser.nextChar() ];

	if ( !type ) {
		return null;
	}

	parser.pos += 1;
	return type;
}
