import { YIELDER } from 'config/types';

var yieldPattern = /^yield\s*/;

export default function readYielder ( parser, tag ) {
	var start, name, yielder;

	if ( !parser.matchPattern( yieldPattern ) ) {
		return null;
	}

	start = parser.pos;
	name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.pos = start;
		return null;
	}

	yielder = { t: YIELDER };

	if ( name ) {
		yielder.n = name;
	}

	return yielder;
}