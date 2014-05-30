import isArray from 'utils/isArray';

export default function getPattern ( ractive, pattern ) {
	var keys, key, values, matchingKeypaths;

	keys = pattern.split( '.' );
	matchingKeypaths = [ '' ];

	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === '' ) { // first key
				matchingKeypaths[0] = key;
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	values = {};

	matchingKeypaths.forEach( keypath => {
		values[ keypath ] = ractive.get( keypath );
	});

	return values;

	function expand ( matchingKeypaths, keypath ) {
		var value, key, childKeypath;

		value = ( ractive._wrapped[ keypath ] ? ractive._wrapped[ keypath ].get() : ractive.get( keypath ) );

		for ( key in value ) {
			if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) { // for benefit of IE8
				childKeypath = keypath ? keypath + '.' + key : key;
				matchingKeypaths.push( childKeypath );
			}
		}

		return matchingKeypaths;
	}

	function concatenate ( key ) {
		return function ( keypath ) {
			return keypath ? keypath + '.' + key : key;
		}
	}
}
