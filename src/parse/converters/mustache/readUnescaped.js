import { TRIPLE } from '../../../config/types';
import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';

export default function readUnescaped ( parser, tag ) {
	if ( !parser.matchString( '&' ) ) {
		return null;
	}

	parser.allowWhitespace();

	const expression = readExpression( parser );

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	const triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}
