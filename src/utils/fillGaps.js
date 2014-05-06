export default function ( target, source ) {
    var key;

    for ( key in source ) {
        if ( source.hasOwnProperty( key ) && !( key in target ) ) {
            target[ key ] = source[ key ];
        }
    }

    return target;
};
