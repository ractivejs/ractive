import { isArray } from 'utils/is';
import { getKeypath, normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

export default function Ractive$merge ( keypath, array, options ) {
	var currentArray,
		promise;

	keypath = getKeypath( normalise( keypath ) );
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

	return promise;
}
