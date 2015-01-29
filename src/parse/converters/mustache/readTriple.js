import { TRIPLE } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import refineExpression from 'parse/utils/refineExpression';

export default function readTriple ( parser ) {
	var expression = readExpression( parser ), triple;

	if ( !expression ) {
		return null;
	}

	triple = { t: TRIPLE };
	refineExpression( expression, triple ); // TODO handle this differently - it's mysterious

	return triple;
}