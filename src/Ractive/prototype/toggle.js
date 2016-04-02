import { badArguments } from '../../config/errors';
import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default function Ractive$toggle ( keypath ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	if ( /\*/.test( keypath ) ) {
		runloop.start();

		this.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			model.set( !model.get() );
		});

		return runloop.end();
	}

	return this.set( keypath, !this.get( keypath ) );
}
