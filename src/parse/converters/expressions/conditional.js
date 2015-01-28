import { CONDITIONAL } from 'config/types';
import getLogicalOr from './logicalOr';
import { expectedExpression } from './shared/errors';
import getExpression from 'parse/converters/expression';

// The conditional operator is the lowest precedence operator, so we start here
export default function getConditional ( parser ) {
	var start, expression, ifTrue, ifFalse;

	expression = getLogicalOr( parser );
	if ( !expression ) {
		return null;
	}

	start = parser.pos;

	parser.allowWhitespace();

	if ( !parser.matchString( '?' ) ) {
		parser.pos = start;
		return expression;
	}

	parser.allowWhitespace();

	ifTrue = getExpression( parser );
	if ( !ifTrue ) {
		parser.error( expectedExpression );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ':' ) ) {
		parser.error( 'Expected ":"' );
	}

	parser.allowWhitespace();

	ifFalse = getExpression( parser );
	if ( !ifFalse ) {
		parser.error( expectedExpression );
	}

	return {
		t: CONDITIONAL,
		o: [ expression, ifTrue, ifFalse ]
	};
}
