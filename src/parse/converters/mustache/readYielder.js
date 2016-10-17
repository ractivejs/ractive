import { YIELDER } from '../../../config/types';
import { readAliases } from './readAliases';

const yieldPattern = /^yield\s*/;
const namePattern = /^(?!with)[a-zA-Z_$][a-zA-Z_$0-9\-]*/;

export default function readYielder ( parser, tag ) {
	if ( !parser.matchPattern( yieldPattern ) ) return null;

	const name = parser.matchPattern( namePattern );
	let aliases;

	parser.allowWhitespace();

	if ( parser.matchString( 'with' ) ) {
		aliases = readAliases( parser );
		if ( !aliases || !aliases.length ) parser.error( `expected one or more aliases` );
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `expected legal partial name` );
	}

	const yielder = { t: YIELDER };
	if ( name ) yielder.n = name;
	if ( aliases ) yielder.z = aliases;

	return yielder;
}
