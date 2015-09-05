import { expectedExpression } from './errors';
import readExpression from '../../readExpression';

export default function readExpressionList ( parser ) {
	parser.allowWhitespace();

	const expr = readExpression( parser );

	if ( expr === null ) return null;

	let expressions = [ expr ];

	// allow whitespace between expression and ','
	parser.allowWhitespace();

	if ( parser.matchString( ',' ) ) {
		const next = readExpressionList( parser );
		if ( next === null ) parser.error( expectedExpression );

		expressions.push.apply( expressions, next );
	}

	return expressions;
}
