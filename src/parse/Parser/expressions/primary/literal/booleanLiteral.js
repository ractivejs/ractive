import types from 'config/types';

export default function ( tokenizer ) {
    var remaining = tokenizer.remaining();

    if ( remaining.substr( 0, 4 ) === 'true' ) {
        tokenizer.pos += 4;
        return {
            t: types.BOOLEAN_LITERAL,
            v: 'true'
        };
    }

    if ( remaining.substr( 0, 5 ) === 'false' ) {
        tokenizer.pos += 5;
        return {
            t: types.BOOLEAN_LITERAL,
            v: 'false'
        };
    }

    return null;
};
