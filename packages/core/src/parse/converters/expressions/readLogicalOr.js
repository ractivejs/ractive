import { INFIX_OPERATOR } from '../../../config/types';
import readTypeof from './readTypeof';

let readLogicalOr;

const makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
	return function ( parser ) {
		// > and / have to be quoted
		if ( parser.inUnquotedAttribute && ( symbol === '>' || symbol === '/' ) ) return fallthrough( parser );

		let start, left, right;

		left = fallthrough( parser );
		if ( !left ) {
			return null;
		}

		// Loop to handle left-recursion in a case like `a * b * c` and produce
		// left association, i.e. `(a * b) * c`.  The matcher can't call itself
		// to parse `left` because that would be infinite regress.
		while ( true ) {
			start = parser.pos;

			parser.allowWhitespace();

			if ( !parser.matchString( symbol ) ) {
				parser.pos = start;
				return left;
			}

			// special case - in operator must not be followed by [a-zA-Z_$0-9]
			if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( parser.remaining().charAt( 0 ) ) ) {
				parser.pos = start;
				return left;
			}

			parser.allowWhitespace();

			// right operand must also consist of only higher-precedence operators
			right = fallthrough( parser );
			if ( !right ) {
				parser.pos = start;
				return left;
			}

			left = {
				t: INFIX_OPERATOR,
				s: symbol,
				o: [ left, right ]
			};

			// Loop back around.  If we don't see another occurrence of the symbol,
			// we'll return left.
		}
	};
};

// create all infix sequence matchers, and return readLogicalOr
(function() {
	let i, len, matcher, fallthrough;

	// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
	// Each sequence matcher will initially fall through to its higher precedence
	// neighbour, and only attempt to match if one of the higher precedence operators
	// (or, ultimately, a literal, reference, or bracketed expression) already matched
	const infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

	// A typeof operator is higher precedence than multiplication
	fallthrough = readTypeof;
	for ( i = 0, len = infixOperators.length; i < len; i += 1 ) {
		matcher = makeInfixSequenceMatcher( infixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// Logical OR is the fallthrough for the conditional matcher
	readLogicalOr = fallthrough;
}());

export default readLogicalOr;
