import createElement from 'utils/createElement';
import defineProperty from 'utils/defineProperty';
import isClient from 'config/isClient';

var defineProperties;

try {
    try {
        Object.defineProperties({}, { test: { value: 0 } });
    } catch ( err ) {
        // TODO how do we account for this? noMagic = true;
        throw err;
    }

    if ( isClient ) {
        Object.defineProperties( createElement( 'div' ), { test: { value: 0 } });
    }

    defineProperties = Object.defineProperties;
} catch ( err ) {
    defineProperties = function ( obj, props ) {
        var prop;

        for ( prop in props ) {
            if ( props.hasOwnProperty( prop ) ) {
                defineProperty( obj, prop, props[ prop ] );
            }
        }
    };
}

export default defineProperties;
