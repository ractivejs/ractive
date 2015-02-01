import { TRIPLE } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import refineExpression from 'parse/utils/refineExpression';

export default function readUnescaped ( parser, delimiters ) {
	var expression, triple;

	if ( !parser.matchString( '&' ) ) {
		return null;
	}

	expression = readExpression( parser );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
	}

	triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}