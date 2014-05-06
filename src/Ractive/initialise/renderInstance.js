import isClient from 'config/isClient';
import Promise from 'utils/Promise';

export default function renderInstance ( ractive, options ) {
    var promise, fulfilPromise;

    // Temporarily disable transitions, if noIntro flag is set
    ractive.transitionsEnabled = ( options.noIntro ? false : options.transitionsEnabled );

    // If we're in a browser, and no element has been specified, create
    // a document fragment to use instead
    if ( isClient && !ractive.el ) {
        ractive.el = document.createDocumentFragment();
    }

    // If the target contains content, and `append` is falsy, clear it
    else if ( ractive.el && !options.append ) {
        ractive.el.innerHTML = '';
    }

    promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });

    ractive.render( ractive.el, ractive.anchor, fulfilPromise );

    if ( options.complete ) {
        promise = promise.then( options.complete.bind( ractive ) );
    }

    // reset transitionsEnabled
    ractive.transitionsEnabled = options.transitionsEnabled;

    return promise;
};
