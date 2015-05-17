import { isNumeric } from 'utils/is';
import { getMatchingKeypaths, normalise } from 'shared/keypaths';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add ( root, keypath, d ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	let value, changes;

	if ( /\*/.test( keypath ) ) {
		changes = {};

		getMatchingKeypaths( root, normalise( keypath ) ).forEach( keypath => {
			let value = root.viewmodel.getContext( keypath ).get();

			if ( !isNumeric( value ) ) {
				throw new Error( errorMessage );
			}

			changes[ keypath ] = value + d;
		});

		return root.set( changes );
	}

	value = root.get( keypath );

	if ( !isNumeric( value ) ) {
		throw new Error( errorMessage );
	}

	return root.set( keypath, +value + d );
}
