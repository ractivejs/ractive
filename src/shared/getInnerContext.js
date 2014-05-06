export default function ( fragment ) {
    do {
        if ( fragment.context ) {
            return fragment.context;
        }
    } while ( fragment = fragment.parent );

    return '';
};
