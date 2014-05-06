import isArray from 'utils/isArray';

export default function ( source ) {
    var target, key;

    if ( !source || typeof source !== 'object' ) {
        return source;
    }

    if ( isArray( source ) ) {
        return source.slice();
    }

    target = {};

    for ( key in source ) {
        if ( source.hasOwnProperty( key ) ) {
            target[ key ] = source[ key ];
        }
    }

    return target;
};
