import Promise from 'utils/Promise';
import runloop from 'global/runloop';
import clearCache from 'shared/clearCache';
import notifyDependants from 'shared/notifyDependants';
import initialiseRegistries from 'Ractive/initialise/initialiseRegistries';
import renderInstance from 'Ractive/initialise/renderInstance';

var shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ].join();

export default function ( data, callback ) {
    var promise, fulfilPromise, wrapper, 
        changes, rerender, i;

    if ( typeof data === 'function' && !callback ) {
        callback = data;
        data = {};
    } else {
        data = data || {};
    }

    if ( typeof data !== 'object' ) {
        throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
    }

    // If the root object is wrapped, try and use the wrapper's reset value
    if ( ( wrapper = this._wrapped[ '' ] ) && wrapper.reset ) {
        if ( wrapper.reset( data ) === false ) {
            // reset was rejected, we need to replace the object
            this.data = data;
        }
    } else {
        this.data = data;
    }

    this.initOptions.data = this.data;

    changes = initialiseRegistries ( this, this.constructor.defaults, 
        this.initOptions, { updatesOnly: true } );
    
    i = changes.length;
    while(i--) {
        if ( shouldRerender.indexOf( changes[i] > -1 ) ) {
            rerender = true;
            break;
        }
    }

    if( rerender ) {

        this.teardown();

        this._initing = true;
        
        promise = renderInstance ( this, this.initOptions );
        
        //same as initialise, but should this be in then()?
        this._initing = false;

        // should this fire and when?
        // this.fire( 'reset', data );

    } else {
        
        promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });

        runloop.start( this, fulfilPromise );

        clearCache( this, '' );
        notifyDependants( this, '' );

        runloop.end();
    
        this.fire( 'reset', data );
    }

    if ( callback ) {
        promise.then( callback );
    }

    return promise;
};
