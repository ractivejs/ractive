import { badArguments } from '../../config/errors';
import { gather, set } from '../../shared/set';

export default function Ractive$toggle ( keypath, options ) {
	if ( typeof keypath !== 'string' ) {
		throw new TypeError( badArguments );
	}

	return set( this, gather( this, keypath, null, options && options.isolated ).map( m => [ m, !m.get() ] ), options );
}
