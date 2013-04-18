(function ( _private ) {

	'use strict';

	var wrapMethods;

	_private.modifyArray = function ( array, keypath, root ) {

		var roots, keypathsByIndex, rootIndex, keypaths;

		if ( !array._ractive ) {
			array._ractive = {
				roots: [ root ],
				keypathsByIndex: [ [ keypath ] ]
			};

			wrapMethods( array );
		}

		else {
			roots = array._ractive.roots;
			keypathsByIndex = array._ractive.keypathsByIndex;

			// see if this root is currently associated with this array
			rootIndex = roots.indexOf( root );

			// if not, associate it
			if ( rootIndex === -1 ) {
				rootIndex = roots.length;
				roots[ rootIndex ] = root;
			}

			// find keypaths that reference this array, on this root
			keypaths = keypathsByIndex[ rootIndex ];

			// if the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}

	};

	wrapMethods = function ( array ) {
		var notifyDependents = function ( array ) {
			var roots, keypathsByIndex;

			roots = array._ractive.roots;
			keypathsByIndex = array._ractive.keypathsByIndex;

			roots.forEach( function ( root, i ) {
				var keypaths = keypathsByIndex[i];

				keypaths.forEach( function ( keypath ) {
					root.set( keypath, array );
				});
			});
		};

		[ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ].forEach( function ( method ) {
			array[ method ] = function () {
				var result = Array.prototype[ method ].apply( this, arguments );
				notifyDependents( array );

				return result;
			};
		});
	};

}( _private ));