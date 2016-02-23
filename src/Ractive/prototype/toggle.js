import { BAD_ARGUMENTS } from '../../messages/errors';
import { splitKeypath } from '../../shared/keypaths';

export default function Ractive$toggle ( keypath ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( BAD_ARGUMENTS );
	}

	let changes;

	if ( /\*/.test( keypath ) ) {
		changes = {};

		this.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			changes[ model.getKeypath() ] = !model.get();
		});

		return this.set( changes );
	}

	return this.set( keypath, !this.get( keypath ) );
}
