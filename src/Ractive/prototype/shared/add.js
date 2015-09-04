import { isNumeric } from '../../../utils/is';
import { splitKeypath } from '../../../shared/keypaths';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add ( ractive, keypath, d ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	let changes;

	if ( /\*/.test( keypath ) ) {
		changes = {};

		ractive.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			const value = model.get();

			if ( !isNumeric( value ) ) throw new Error( errorMessage );

			changes[ model.getKeypath() ] = value + d;
		});

		return ractive.set( changes );
	}

	const value = ractive.get( keypath );

	if ( !isNumeric( value ) ) {
		throw new Error( errorMessage );
	}

	return ractive.set( keypath, +value + d );
}
