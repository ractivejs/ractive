import { isNumeric } from 'utils/is';
import { getKeypath, getMatchingKeypaths, normalise } from 'shared/keypaths';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add ( root, keypath, d ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	let value, changes;

	if ( /\*/.test( keypath ) ) {
		changes = {};

		getMatchingKeypaths( root, getKeypath( normalise( keypath ) ) ).forEach( keypath => {
			let value = root.viewmodel.get( keypath );

			if ( !isNumeric( value ) ) {
				throw new Error( errorMessage );
			}

			changes[ keypath.str ] = value + d;
		});

		return root.set( changes );
	}

	value = root.get( keypath );

	if ( !isNumeric( value ) ) {
		throw new Error( errorMessage );
	}

	return root.set( keypath, +value + d );
}
