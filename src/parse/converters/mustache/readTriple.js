import { TRIPLE } from '../../../config/types';
import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';

export default function readTriple ( parser, tag ) {
	var expression = readExpression( parser ), triple;

	if ( !expression ) {
		return null;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}