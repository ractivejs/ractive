import { badArguments } from 'config/errors';

export default function Ractive$toggle ( keypath ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	return this.set( keypath, !this.get( keypath ) );
}
