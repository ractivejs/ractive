import { arrayContentsMatch } from 'utils/array';
import { isEqual } from 'utils/is';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'global/runloop';

export default function Ractive$updateModel ( keypath, cascade ) {
	const promise = runloop.start( this, true );
	let bindings;

	if ( !keypath ) {
		this.viewmodel.updateFromBindings( true );
	} else {
		this.viewmodel.join( splitKeypath( keypath ) ).updateFromBindings( cascade );
	}

	runloop.end();

	return promise;
}
