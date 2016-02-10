import { isRactiveElement } from '../../utils/is';
import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';

const updateHook = new Hook( 'update' );

export default function Ractive$update ( keypath, context ) {
	let model;

	if ( keypath ) {
		if ( isRactiveElement( context ) ) model = resolveReference( context._ractive.fragment, keypath );
		else model = this.viewmodel.joinAll( splitKeypath( keypath ) );
	} else {
		model = this.viewmodel;
	}

	const promise = runloop.start( this, true );
	model.mark();
	runloop.end();

	updateHook.fire( this, model );

	return promise;
}
