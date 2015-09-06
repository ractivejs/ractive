import { BRACKETED } from '../../../../config/types';
import { expectedExpression, expectedParen } from '../shared/errors';
import readExpression from '../../readExpression';

export default function readBracketedExpression ( parser ) {
	if ( !parser.matchString( '(' ) ) return null;

	parser.allowWhitespace();

	const expr = readExpression( parser );

	if ( !expr ) parser.error( expectedExpression );

	parser.allowWhitespace();

	if ( !parser.matchString( ')' ) ) parser.error( expectedParen );

	return {
		t: BRACKETED,
		x: expr
	};
}
