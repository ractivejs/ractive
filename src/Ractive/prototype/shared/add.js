import { isNumeric } from '../../../utils/is';
import { build, set } from '../../../shared/set';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add ( ractive, keypath, d ) {
	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	const sets = build( ractive, keypath, d );

	return set( ractive, sets.map( pair => {
		const [ model, add ] = pair, value = model.get();
		if ( !isNumeric( add ) || !isNumeric( value ) ) throw new Error( errorMessage );
		return [ model, value + add ];
	}));
}
