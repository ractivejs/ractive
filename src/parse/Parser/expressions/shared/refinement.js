import types from 'config/types';
import patterns from 'parse/Parser/expressions/patterns';

export default function getRefinement ( parser ) {
    var start, name, expr;

    start = parser.pos;

    parser.allowWhitespace();

    // "." name
    if ( parser.matchString( '.' ) ) {
        parser.allowWhitespace();

        if ( name = parser.matchPattern( patterns.name ) ) {
            return {
                t: types.REFINEMENT,
                n: name
            };
        }

        parser.error( 'Expected a property name' );
    }

    // "[" expression "]"
    if ( parser.matchString( '[' ) ) {
        parser.allowWhitespace();

        expr = parser.readExpression();
        if ( !expr ) {
            parser.error( 'an expression' );
        }

        parser.allowWhitespace();

        if ( !parser.matchString( ']' ) ) {
            parser.error( 'Expected \']\'' );
        }

        return {
            t: types.REFINEMENT,
            x: expr
        };
    }

    return null;
};
