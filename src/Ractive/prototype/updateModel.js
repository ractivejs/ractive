import { splitKeypath } from '../../shared/keypaths';
import { isRactiveElement } from '../../utils/is';
import resolveReference from '../../view/resolvers/resolveReference';
import runloop from '../../global/runloop';

export default function Ractive$updateModel ( keypath, cascade, overflow ) {
	const promise = runloop.start( this, true );

	if ( !keypath ) {
		this.viewmodel.updateFromBindings( true );
	} else {
		let model;
		if ( isRactiveElement( cascade ) ) {
			model = resolveReference( cascade._ractive.fragment, keypath );
			cascade = overflow;
		} else {
			model = this.viewmodel.joinAll( splitKeypath( keypath ) );
		}

		model.updateFromBindings( cascade !== false );
	}

	runloop.end();

	return promise;
}
