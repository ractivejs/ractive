import { badArguments } from '../../config/errors';
import { splitKeypath } from '../../shared/keypaths';

export default function Ractive$toggle ( keypath, context ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	let changes;

	if ( /\*/.test( keypath ) ) {
		changes = {};

		this.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			changes[ model.getKeypath() ] = !model.get();
		});

		return this.set( changes );
	}

	return this.set( keypath, !this.get( keypath, context ), context );
}
