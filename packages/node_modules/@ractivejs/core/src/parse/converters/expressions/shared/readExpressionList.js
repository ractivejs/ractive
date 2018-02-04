import { expectedExpression } from './errors';
import readExpression from '../../readExpression';
import { spreadPattern } from './patterns';

export default function readExpressionList ( parser, spread ) {
	let isSpread;
	const expressions = [];

	const pos = parser.pos;

	do {
		parser.allowWhitespace();

		if ( spread ) {
			isSpread = parser.matchPattern( spreadPattern );
		}

		const expr = readExpression( parser );

		if ( expr === null && expressions.length ) {
			parser.error( expectedExpression );
		} else if ( expr === null ) {
			parser.pos = pos;
			return null;
		}

		if ( isSpread ) {
			expr.p = true;
		}

		expressions.push( expr );

		parser.allowWhitespace();
	} while ( parser.matchString( ',' ) );

	return expressions;
}
