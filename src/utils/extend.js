export default function ( target ) {
    var prop, source, sources = Array.prototype.slice.call( arguments, 1 );

    while ( source = sources.shift() ) {
        for ( prop in source ) {
            if ( source.hasOwnProperty ( prop ) ) {
                target[ prop ] = source[ prop ];
            }
        }
    }

    return target;
};
