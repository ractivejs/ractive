import { badArguments } from 'config/errors';
import { getKeypath, getMatchingKeypaths, normalise } from 'shared/keypaths';

export default function Ractive$toggle ( keypath ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	let changes;

	if ( /\*/.test( keypath ) ) {
		changes = {};

		getMatchingKeypaths( this, normalise( keypath ) ).forEach( keypath => {
			changes[ keypath ] = !this.viewmodel.getModel( keypath ).get();
		});

		return this.set( changes );
	}

	return this.set( keypath, !this.get( keypath ) );
}
