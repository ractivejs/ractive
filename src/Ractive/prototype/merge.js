import runloop from 'global/runloop';
import isArray from 'utils/isArray';
import normaliseKeypath from 'utils/normaliseKeypath';

export default function Ractive$merge ( keypath, array, options ) {

	var currentArray,
		promise;

	keypath = normaliseKeypath( keypath );
	currentArray = this.viewmodel.get( keypath );

	// If either the existing value or the new value isn't an
	// array, just do a regular set
	if ( !isArray( currentArray ) || !isArray( array ) ) {
		return this.set( keypath, array, options && options.complete );
	}

	// Manage transitions
	promise = runloop.start( this, true );
	this.viewmodel.merge( keypath, currentArray, array, options );
	runloop.end();

	// attach callback as fulfilment handler, if specified
	if ( options && options.complete ) {
		promise.then( options.complete );
	}

	return promise;
}
