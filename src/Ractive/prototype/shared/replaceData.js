define( function () {

	'use strict';

	return function ( ractive, keypath, value ) {
		var keys, accumulated, wrapped, obj, key, currentKeypath, keypathToClear;

		keys = keypath.split( '.' );
		accumulated = [];

		// Get the root object
		if ( wrapped = ractive._wrapped[ '' ] ) {
			if ( wrapped.set ) {
				// Root object is wrapped, so we need to use the wrapper's
				// set() method
				wrapped.set( keys.join( '.' ), value );
			}

			obj = wrapped.get();
		} else {
			obj = ractive.data;
		}


		while ( keys.length > 1 ) {
			key = accumulated[ accumulated.length ] = keys.shift();
			currentKeypath = accumulated.join( '.' );

			if ( wrapped = ractive._wrapped[ currentKeypath ] ) {
				if ( wrapped.set ) {
					wrapped.set( keys.join( '.' ), value );
				}

				obj = wrapped.get();
			}

			else {
				// If this branch doesn't exist yet, create a new one - if the next
				// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
				// than an object
				if ( !obj.hasOwnProperty( key ) ) {

					// if we're creating a new branch, we may need to clear the upstream
					// keypath
					if ( !keypathToClear ) {
						keypathToClear = currentKeypath;
					}

					obj[ key ] = ( /^\s*[0-9]+\s*$/.test( keys[0] ) ? [] : {} );
				}

				obj = obj[ key ];
			}
		}

		key = keys[0];
		obj[ key ] = value;

		return keypathToClear;
	};

});