import { SECTION, INVERTED, CLOSING, PARTIAL, COMMENT, TRIPLE } from 'config/types';

var mustacheTypes = {
	'#': SECTION,
	'^': INVERTED,
	'/': CLOSING,
	'>': PARTIAL,
	'!': COMMENT,
	'&': TRIPLE
};

export default function ( parser ) {
	var type = mustacheTypes[ parser.str.charAt( parser.pos ) ];

	if ( !type ) {
		return null;
	}

	parser.pos += 1;
	return type;
}
