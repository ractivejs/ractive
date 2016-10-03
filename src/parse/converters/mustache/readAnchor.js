import { ANCHOR } from '../../../config/types';
import readExpr from '../readExpressionOrReference';
import refineExpression from '../../utils/refineExpression';

const namePattern = /^[-a-zA-Z0-9_$#]+/;
const mappingPattern = /^[a-zA-Z$][a-zA-Z0-9$]*/;
const quotePattern = /^['"]/;

export default function readAnchor ( parser, tag ) {
	if ( !parser.matchString( '>>' ) ) return null;

	parser.allowWhitespace();

	let multi = false, mapping, attrs;
	const name = parser.matchPattern( namePattern );

	if ( !name ) parser.error( `Expected a valid anchor name.` );

	parser.allowWhitespace();

	if ( parser.matchString( 'multi' ) ) multi = true;

	parser.inTag = true;

	let i = 0;
	// mappings
	while ( mapping = readMapping( parser ) ) {
		if ( !attrs ) attrs = {};
		attrs[ mapping.n ] = mapping.f;

		parser.allowWhitespace();
		if ( i++ > 5 ) {
			debugger;
			break;
		}
	}

	parser.inTag = false;

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	const result = {
		t: ANCHOR,
		n: name,
		m: multi
	};
	if ( attrs ) result.a = attrs;
	return result;
}

function readMapping( parser ) {
	parser.allowWhitespace();

	const name = parser.matchPattern( mappingPattern );
	const tag = parser.tags[2]; // regular mustache delim

	if ( !name ) return null;

	parser.allowWhitespace();
	if ( !parser.matchString( '=' ) ) parser.error( `Expected '=' in anchor mapping '${name}'` );

	parser.allowWhitespace();
	let quote = parser.matchPattern( quotePattern );
	if ( !parser.matchString( tag.open ) ) parser.error( `Expected anchor mapping '${name}' value to contain a plain mustache '${tag.open}'` );
	parser.allowWhitespace();
	const expr = readExpr( parser, [ tag.close ] );
	if ( !expr ) parser.error( `Expected anchor mapping '${name}' to contain an expression` );
	if ( !parser.matchString( tag.close ) ) parser.error( `Unclosed mustache in anchor mapping '${name}'` );
	if ( quote && !parser.matchString( quote ) ) parser.error( `Expected anchor mapping '${name}' to end with a matching quote '${quote}'` );

	return {
		n: name,
		f: refineExpression( expr, {} )
	};
}
