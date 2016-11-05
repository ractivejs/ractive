import { REFERENCE } from '../../config/types';
import readExpression from './readExpression';
import readReference from './expressions/primary/readReference';

export default function readExpressionOrReference ( parser, expectedFollowers ) {
	const start = parser.pos;
	const expression = readExpression( parser );

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

	for ( let i = 0; i < expectedFollowers.length; i += 1 ) {
		if ( parser.remaining().substr( 0, expectedFollowers[i].length ) === expectedFollowers[i] ) {
			return expression;
		}
	}

	parser.pos = start;
	return readReference( parser );
}
