import { YIELDER } from '../../../config/types';

var yieldPattern = /^yield\s*/;

export default function readYielder ( parser, tag ) {
	if ( !parser.matchPattern( yieldPattern ) ) return null;

	const name = parser.matchPattern( /^[a-zA-Z_$][a-zA-Z_$0-9\-]*/ );

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `expected legal partial name` );
	}

	let yielder = { t: YIELDER };
	if ( name ) yielder.n = name;

	return yielder;
}
