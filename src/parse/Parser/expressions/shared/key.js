import getStringLiteral from 'parse/Parser/expressions/primary/literal/stringLiteral/_stringLiteral';
import getNumberLiteral from 'parse/Parser/expressions/primary/literal/numberLiteral';
import patterns from 'parse/Parser/expressions/patterns';

var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

// http://mathiasbynens.be/notes/javascript-properties
// can be any name, string literal, or number literal
export default function ( parser ) {
    var token;

    if ( token = getStringLiteral( parser ) ) {
        return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
    }

    if ( token = getNumberLiteral( parser ) ) {
        return token.v;
    }

    if ( token = parser.matchPattern( patterns.name ) ) {
        return token;
    }
};
