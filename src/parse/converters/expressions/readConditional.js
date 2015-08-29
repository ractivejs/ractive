import { CONDITIONAL } from '../../../config/types';
import readLogicalOr from './readLogicalOr';
import { expectedExpression } from './shared/errors';
import readExpression from '../readExpression';

// The conditional operator is the lowest precedence operator, so we start here
export default function getConditional ( parser ) {
	var start, expression, ifTrue, ifFalse;

	expression = readLogicalOr( parser );
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

	ifTrue = readExpression( parser );
	if ( !ifTrue ) {
		parser.error( expectedExpression );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ':' ) ) {
		parser.error( 'Expected ":"' );
	}

	parser.allowWhitespace();

	ifFalse = readExpression( parser );
	if ( !ifFalse ) {
		parser.error( expectedExpression );
	}

	return {
		t: CONDITIONAL,
		o: [ expression, ifTrue, ifFalse ]
	};
}
