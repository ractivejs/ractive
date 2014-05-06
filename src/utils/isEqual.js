export default function ( a, b ) {
    if ( a === null && b === null ) {
        return true;
    }

    if ( typeof a === 'object' || typeof b === 'object' ) {
        return false;
    }

    return a === b;
};
