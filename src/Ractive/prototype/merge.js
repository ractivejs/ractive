import { normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

export default function Ractive$merge ( keypath, array, options ) {
	const context = this.viewmodel.getContext( normalise( keypath ) ),
		  promise = runloop.start( this, true );

	context.merge( array, options );

	runloop.end();
	return promise;
}
