import { isNumeric, isRactiveElement } from '../../../utils/is';
import { splitKeypath } from '../../../shared/keypaths';

const errorMessage = 'Cannot add to a non-numeric value';

export default function add ( ractive, args, def ) {
	let keypath = args[0], d, context = args[2];

	if ( args.length === 1 ) d = def;
	else if ( isRactiveElement( args[1] ) ) {
		d = def;
		context = args[1];
	} else d = args[1];

	if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
		throw new Error( 'Bad arguments' );
	}

	// swap sign for subtract
	if ( d !== def ) d = d * def;

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

	const value = ractive.get( keypath, context );

	if ( !isNumeric( value ) ) {
		throw new Error( errorMessage );
	}

	return ractive.set( keypath, +value + d, context );
}
