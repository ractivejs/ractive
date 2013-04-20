(function ( _internal ) {

	'use strict';

	var wrapMethods;

	_internal.modifyArray = function ( array, keypath, root ) {

		var roots, keypathsByIndex, rootIndex, keypaths;

		// If this array hasn't been wrapped, wrap it
		if ( !array._ractive ) {
			array._ractive = {
				roots: [ root ], // there may be more than one Ractive instance depending on this
				keypathsByIndex: [ [ keypath ] ]
			};

			wrapMethods( array );
		}

		else {
			roots = array._ractive.roots;
			keypathsByIndex = array._ractive.keypathsByIndex;

			// Does this Ractive instance currently depend on this array
			rootIndex = roots.indexOf( root );

			// If not, associate them
			if ( rootIndex === -1 ) {
				rootIndex = roots.length;
				roots[ rootIndex ] = root;
			}

			// Find keypaths that reference this array, on this Ractive instance
			keypaths = keypathsByIndex[ rootIndex ];

			// If the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}

	};

	wrapMethods = function ( array ) {
		var notifyDependents = function ( array ) {
			var roots, keypathsByIndex, root, keypaths, i, j;

			roots = array._ractive.roots;
			keypathsByIndex = array._ractive.keypathsByIndex;

			i = roots.length;
			while ( i-- ) {
				root = roots[i];
				keypaths = keypathsByIndex[i];

				j = keypaths.length;
				while ( j-- ) {
					root.set( keypaths[j], array );
				}
			}
		};

		[ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ].forEach( function ( method ) {
			array[ method ] = function () {
				var result = Array.prototype[ method ].apply( this, arguments );
				notifyDependents( array );

				return result;
			};
		});
	};

}( _internal ));