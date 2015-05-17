import { isArray } from 'utils/is';
import { normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

export default function Ractive$merge ( keypath, array, options ) {
	var model,
		currentArray,
		promise;

	model = this.viewmodel.getContext( keypath );
	currentArray = this.viewmodel.get( model );

	// If either the existing value or the new value isn't an
	// array, just do a regular set
	if ( !isArray( currentArray ) || !isArray( array ) ) {
		// TODO: won't work with model
		return this.set( model, array, options && options.complete );
	}

	// Manage transitions
	promise = runloop.start( this, true );
	this.viewmodel.merge( model, currentArray, array, options );
	runloop.end();

	return promise;
}
