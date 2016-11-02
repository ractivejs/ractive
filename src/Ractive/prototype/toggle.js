import { message } from '../../utils/log';
import { gather, set } from '../../shared/set';

export default function Ractive$toggle ( keypath ) {
	if ( typeof keypath !== 'string' ) {
		message( 'BAD_ARGUMENTS', 'string', keypath );
	}

	return set( this, gather( this, keypath ).map( m => [ m, !m.get() ] ) );
}
