import runloop from 'global/runloop';
import isObject from 'utils/isObject';
import normaliseKeypath from 'utils/normaliseKeypath';
import Promise from 'utils/Promise';
import set from 'shared/set';

export default function Ractive_prototype_set ( keypath, value, callback ) {
    var map,
        promise,
        fulfilPromise;

    promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
    runloop.start( this, fulfilPromise );

    // Set multiple keypaths in one go
    if ( isObject( keypath ) ) {
        map = keypath;
        callback = value;

        for ( keypath in map ) {
            if ( map.hasOwnProperty( keypath) ) {
                value = map[ keypath ];
                keypath = normaliseKeypath( keypath );

                set( this, keypath, value );
            }
        }
    }

    // Set a single keypath
    else {
        keypath = normaliseKeypath( keypath );
        set( this, keypath, value );
    }

    runloop.end();

    if ( callback ) {
        promise.then( callback.bind( this ) );
    }

    return promise;
};
