define(['utils/isArray'],function (isArray) {

	'use strict';
	
	return function getMatchingKeypaths ( ractive, pattern ) {
		var keys, key, matchingKeypaths;
	
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
	
		return matchingKeypaths;
	
		function expand ( matchingKeypaths, keypath ) {
			var value, key, childKeypath;
	
			value = ( ractive.viewmodel.wrapped[ keypath ] ? ractive.viewmodel.wrapped[ keypath ].get() : ractive.get( keypath ) );
	
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
			};
		}
	};

});