import { REFERENCE } from '../../constants/types';
import readExpression from './readExpression';
import readReference from './expressions/primary/readReference';

export default function readExpressionOrReference ( parser, expectedFollowers ) {
	var start, expression, i;

	start = parser.pos;
	expression = readExpression( parser );

	if ( !expression ) {
		// valid reference but invalid expression e.g. `{{new}}`?
		const ref = parser.matchPattern( /^(\w+)/ );
		if ( ref ) {
			return {
				t: REFERENCE,
				n: ref
			};
		}

		return null;
	}

	for ( i = 0; i < expectedFollowers.length; i += 1 ) {
		if ( parser.remaining().substr( 0, expectedFollowers[i].length ) === expectedFollowers[i] ) {
			return expression;
		}
	}

	parser.pos = start;
	return readReference( parser );
}
