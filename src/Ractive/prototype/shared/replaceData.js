define([
	'utils/clone',
	'utils/createBranch',
	'shared/clearCache'
], function (
	clone,
	createBranch,
	clearCache
) {

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
			key = keys.shift();
			accumulated.push( key );
			currentKeypath = accumulated.join( '.' );

			if ( wrapped = ractive._wrapped[ currentKeypath ] ) {
				if ( wrapped.set ) {
					wrapped.set( keys.join( '.' ), value );
				}

				obj = wrapped.get();
			}

			else {

				// If the keypath we're updating currently points to data that belongs
				// to this.constructor.data, rather than this.data, we need to clone
				// it so that we don't end up modifying data that doesn't belong to us
				if ( !obj.hasOwnProperty( key ) && key in obj ) {
					if ( !keypathToClear ) {
						keypathToClear = currentKeypath;
					}
					obj[ key ] = clone( obj[ key ] );
				}

				// If this branch doesn't exist yet, create a new one - if the next
				// key is numeric, assume we want an array branch rather than an object
				if ( !obj[ key ] ) {
					if ( !keypathToClear ) {
						keypathToClear = currentKeypath;
					}
					obj[ key ] = createBranch( keys[0] );
				}

				obj = obj[ key ];
			}
		}

		key = keys[0];
		obj[ key ] = value;

		clearCache( ractive, keypathToClear || keypath );
	};

});