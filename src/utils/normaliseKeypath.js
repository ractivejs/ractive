var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

export default function normaliseKeypath ( keypath ) {
    return ( keypath || '' ).replace( regex, '.$1' );
};
