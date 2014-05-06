import types from 'config/types';

var mustacheTypes = {
    '#': types.SECTION,
    '^': types.INVERTED,
    '/': types.CLOSING,
    '>': types.PARTIAL,
    '!': types.COMMENT,
    '&': types.TRIPLE
};

export default function ( parser ) {
    var type = mustacheTypes[ parser.str.charAt( parser.pos ) ];

    if ( !type ) {
        return null;
    }

    parser.pos += 1;
    return type;
};
