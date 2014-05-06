import types from 'config/types';
import getLogicalOr from 'parse/Parser/expressions/logicalOr';

// The conditional operator is the lowest precedence operator, so we start here
export default function ( parser ) {
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

    ifTrue = parser.readExpression();
    if ( !ifTrue ) {
        parser.pos = start;
        return expression;
    }

    parser.allowWhitespace();

    if ( !parser.matchString( ':' ) ) {
        parser.pos = start;
        return expression;
    }

    parser.allowWhitespace();

    ifFalse = parser.readExpression();
    if ( !ifFalse ) {
        parser.pos = start;
        return expression;
    }

    return {
        t: types.CONDITIONAL,
        o: [ expression, ifTrue, ifFalse ]
    };
};
