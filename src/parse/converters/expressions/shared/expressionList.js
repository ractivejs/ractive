import { expectedExpression } from './errors';
import getExpression from 'parse/converters/expression';

export default function getExpressionList ( parser ) {
	var start, expressions, expr, next;

	start = parser.pos;

	parser.allowWhitespace();

	expr = getExpression( parser );

	if ( expr === null ) {
		return null;
	}

	expressions = [ expr ];

	// allow whitespace between expression and ','
	parser.allowWhitespace();

	if ( parser.matchString( ',' ) ) {
		next = getExpressionList( parser );
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
