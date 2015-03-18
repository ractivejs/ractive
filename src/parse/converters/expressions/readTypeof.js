import { PREFIX_OPERATOR } from 'config/types';
import { expectedExpression } from './shared/errors';
import readMemberOrInvocation from './readMemberOrInvocation';
import readExpression from 'parse/converters/readExpression';

var readTypeOf, makePrefixSequenceMatcher;

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

		expression = readExpression( parser );
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

// create all prefix sequence matchers, return readTypeOf
(function() {
	var i, len, matcher, prefixOperators, fallthrough;

	prefixOperators = '! ~ + - typeof'.split( ' ' );

	fallthrough = readMemberOrInvocation;
	for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
		matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
		fallthrough = matcher;
	}

	// typeof operator is higher precedence than multiplication, so provides the
	// fallthrough for the multiplication sequence matcher we're about to create
	// (we're skipping void and delete)
	readTypeOf = fallthrough;
}());

export default readTypeOf;
