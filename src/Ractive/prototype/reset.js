import Promise from 'utils/Promise';
import runloop from 'global/runloop';
import clearCache from 'shared/clearCache';
import notifyDependants from 'shared/notifyDependants';
import Fragment from 'virtualdom/Fragment';
import initialiseRegistries from 'Ractive/initialise/initialiseRegistries';

var shouldRerender = [ 'template', 'partials', 'components', 'decorators', 'events' ].join();

export default function ( data, callback ) {
	var self = this,
		promise,
		fulfilPromise,
		wrapper,
		changes,
		rerender,
		i;

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

	changes = initialiseRegistries( this, this.constructor.defaults, this.initOptions, { updatesOnly: true } );

	i = changes.length;
	while ( i-- ) {
		if ( shouldRerender.indexOf( changes[i] > -1 ) ) {
			rerender = true;
			break;
		}
	}

	promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });

	if ( rerender ) {
		clearCache( self, '' );
		notifyDependants( self, '' );

		this.unrender();

		// If the template changed, we need to destroy the parallel DOM
		// TODO if we're here, presumably it did?
		if ( this.fragment.template !== this.template ) {
			this.fragment.teardown();

			this.fragment = new Fragment({
				template: this.template,
				root: this,
				owner: this
			});
		}

		this.render( this.el, this.anchor ).then( fulfilPromise );
	} else {
		runloop.start( this, fulfilPromise );
		clearCache( this, '' );
		notifyDependants( this, '' );
		runloop.end();
	}

	this.fire( 'reset', data );

	if ( callback ) {
		promise.then( callback );
	}

	return promise;
}
