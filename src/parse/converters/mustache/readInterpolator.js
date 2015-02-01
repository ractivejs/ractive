import { INTERPOLATOR, REFERENCE } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import readReference from 'parse/converters/readReference';
import refineExpression from 'parse/utils/refineExpression';

var legalReference = /^[a-zA-Z$_0-9]+(?:(\.[a-zA-Z$_0-9]+)|(\[[a-zA-Z$_0-9]+\]))*/;

export default function readInterpolator ( parser, delimiters ) {
	console.log( 'readInterpolator: "%s"', parser.remaining() );

	var start, expression, interpolator;

	start = parser.pos;

	expression = readExpression( parser );
	console.log( 'expression', expression );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}' after reference` );

		if ( !expression ) {
			// special case - comment
			if ( parser.nextChar() === '!' ) {
				return null;
			}

			parser.error( `Expected expression or legal reference` );
		}

		// if ( !parser.matchString( delimiters.content[1] ) ) {

		// }
	}

	interpolator = { t: INTERPOLATOR };
	refineExpression( expression, interpolator ); // TODO handle this differently - it's mysterious

	return interpolator;
}