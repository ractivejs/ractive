import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default function Ractive$updateModel ( keypath, cascade ) {
	const promise = runloop.start( this, true );

	if ( !keypath ) {
		this.viewmodel.updateFromBindings( true );
	} else {
		this.viewmodel.joinAll( splitKeypath( keypath ) ).updateFromBindings( cascade !== false );
	}

	runloop.end();

	return promise;
}
