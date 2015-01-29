import { TRIPLE } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import refineExpression from 'parse/utils/refineExpression';

export default function readTriple ( parser, delimiters ) {
	var expression = readExpression( parser ), triple;

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}' after reference` );
	}

	triple = { t: TRIPLE };
	refineExpression( expression, triple );

	if ( delimiters.isStatic ) {
		triple.s = true; // TODO remove this from here, and make it 1 instead of true
	}

	return triple;
}