import types from 'config/types';

var OPEN_COMMENT = '<!--',
    CLOSE_COMMENT = '-->';

export default function ( parser ) {
    var startPos, content, remaining, endIndex, comment;

    startPos = parser.getLinePos();

    if ( !parser.matchString( OPEN_COMMENT ) ) {
        return null;
    }

    remaining = parser.remaining();
    endIndex = remaining.indexOf( CLOSE_COMMENT );

    if ( endIndex === -1 ) {
        parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
    }

    content = remaining.substr( 0, endIndex );
    parser.pos += endIndex + 3;

    comment = {
        t: types.COMMENT,
        c: content
    };

    if ( parser.includeLinePositions ) {
        comment.p = startPos.toJSON();
    }

    return comment;
};
