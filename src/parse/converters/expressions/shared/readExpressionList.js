import { expectedExpression } from './errors';
import readExpression from '../../readExpression';

export default function readExpressionList ( parser ) {
	var start, expressions, expr, next;

	start = parser.pos;

	parser.allowWhitespace();

	expr = readExpression( parser );

	if ( expr === null ) {
		return null;
	}

	expressions = [ expr ];

	// allow whitespace between expression and ','
	parser.allowWhitespace();

	if ( parser.matchString( ',' ) ) {
		next = readExpressionList( parser );
		if ( next === null ) {
			parser.error( expectedExpression );
		}

		next.forEach( append );
	}

	function append ( expression ) {
		expressions.push( expression );
	}

	return expressions;
}
