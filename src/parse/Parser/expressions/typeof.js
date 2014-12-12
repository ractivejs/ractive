import { PREFIX_OPERATOR } from 'config/types';
import { expectedExpression } from './shared/errors';
import getMemberOrInvocation from './memberOrInvocation';

var getTypeof, makePrefixSequenceMatcher;

makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
	return function ( parser ) {
		var expression;

		if ( expression = fallthrough( parser ) ) {
			return expression;
		}

		if ( !parser.matchString( symbol ) ) {
			return null;
		}

		parser.allowWhitespace();

		expression = parser.readExpression();
		if ( !expression ) {
			parser.error( expectedExpression );
		}

		return {
			s: symbol,
			o: expression,
			t: PREFIX_OPERATOR
		};
	};
};

// create all prefix sequence matchers, return getTypeof
(function() {
	var i, len, matcher, prefixOperators, fallthrough;

	prefixOperators = '! ~ + - typeof'.split( ' ' );

	fallthrough = getMemberOrInvocation;
	for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
		matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// typeof operator is higher precedence than multiplication, so provides the
	// fallthrough for the multiplication sequence matcher we're about to create
	// (we're skipping void and delete)
	getTypeof = fallthrough;
}());

export default getTypeof;
