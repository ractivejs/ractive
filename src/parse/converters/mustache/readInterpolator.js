import { INTERPOLATOR } from 'config/types';
import readExpressionOrReference from 'parse/converters/readExpressionOrReference';
import refineExpression from 'parse/utils/refineExpression';

export default function readInterpolator ( parser, tag ) {
	var start, expression, interpolator, err;

	start = parser.pos;

	// TODO would be good for perf if we could do away with the try-catch
	try {
		expression = readExpressionOrReference( parser, [ tag.close ]);
	} catch ( e ) {
		err = e;
	}

	if ( !expression ) {
		if ( parser.str.charAt( start ) === '!' ) {
			// special case - comment
			return null;
		}

		if ( err ) {
			throw err;
		}
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}' after reference` );

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