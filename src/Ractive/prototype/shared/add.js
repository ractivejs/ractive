import { isNumeric } from '../../../utils/is';
import { splitKeypath } from '../../../shared/keypaths';
import runloop from '../../../global/runloop';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add ( ractive, keypath, d ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	if ( /\*/.test( keypath ) ) {
		runloop.start();

		ractive.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			const value = model.get();

			if ( !isNumeric( value ) ) {
				runloop.end();
				throw new Error( errorMessage );
			}

			model.set( value + d );
		});

		return runloop.end();
	}

	const value = ractive.get( keypath );

	if ( !isNumeric( value ) ) {
		throw new Error( errorMessage );
	}

	return ractive.set( keypath, +value + d );
}
