import { INTERPOLATOR } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import readExpressionOrReference from 'parse/converters/readExpressionOrReference';
import refineExpression from 'parse/utils/refineExpression';

export default function readInterpolator ( parser, delimiters ) {
	var start, expression, interpolator;

	start = parser.pos;

	expression = readExpressionOrReference( parser, [ delimiters.content[1] ]);
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
	}

	interpolator = { t: INTERPOLATOR };
	refineExpression( expression, interpolator ); // TODO handle this differently - it's mysterious

	return interpolator;
}