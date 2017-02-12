import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import { splitKeypath } from '../../shared/keypaths';

const updateHook = new Hook( 'update' );

export function update ( ractive, model, options ) {
	// if the parent is wrapped, the adaptor will need to be updated before
	// updating on this keypath
	if ( model.parent && model.parent.wrapper ) {
		model.parent.adapt();
	}

	const promise = runloop.start( ractive, true );

	model.mark( options && options.force );

	// notify upstream of changes
	model.notifyUpstream();

	runloop.end();

	updateHook.fire( ractive, model );

	return promise;
}

export default function Ractive$update ( keypath, options ) {
	if ( keypath ) keypath = splitKeypath( keypath );

	return update( this, keypath ? this.viewmodel.joinAll( keypath ) : this.viewmodel, options );
}
