import runloop from 'global/runloop';
import isArray from 'utils/isArray';
import Promise from 'utils/Promise';
import normaliseKeypath from 'utils/normaliseKeypath';

var comparators = {};

export default function Ractive$merge ( keypath, array, options ) {

	var currentArray,
		oldArray,
		newArray,
		comparator,
		lengthUnchanged,
		newIndices,
		promise,
		fulfilPromise;

	keypath = normaliseKeypath( keypath );
	currentArray = this.viewmodel.get( keypath );

	// If either the existing value or the new value isn't an
	// array, just do a regular set
	if ( !isArray( currentArray ) || !isArray( array ) ) {
		return this.set( keypath, array, options && options.complete );
	}

	// Manage transitions
	promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });

	runloop.start( this, fulfilPromise );
	this.viewmodel.merge( keypath, currentArray, array, options );
	runloop.end();

	// attach callback as fulfilment handler, if specified
	if ( options && options.complete ) {
		promise.then( options.complete );
	}

	return promise;
}
