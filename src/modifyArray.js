(function ( A ) {

	'use strict';

	var wrapMethods;

	A.modifyArray = function ( array, keypath, viewmodel ) {

		var viewmodels, keypathsByIndex, viewmodelIndex, keypaths;

		if ( !array._anglebars ) {
			array._anglebars = {
				viewmodels: [ viewmodel ],
				keypathsByIndex: [ [ keypath ] ]
			};

			wrapMethods( array );
		}

		else {
			viewmodels = array._anglebars.viewmodels;
			keypathsByIndex = array._anglebars.keypathsByIndex;

			// see if this viewmodel is currently associated with this array
			viewmodelIndex = viewmodels.indexOf( viewmodel );

			// if not, associate it
			if ( viewmodelIndex === -1 ) {
				viewmodelIndex = viewmodels.length;
				viewmodels[ viewmodelIndex ] = viewmodel;
			}

			// find keypaths that reference this array, on this viewmodel
			keypaths = keypathsByIndex[ viewmodelIndex ];

			// if the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}

	};

	wrapMethods = function ( array ) {
		var notifyDependents = function ( array ) {
			var viewmodels, keypathsByIndex;

			viewmodels = array._anglebars.viewmodels;
			keypathsByIndex = array._anglebars.keypathsByIndex;

			viewmodels.forEach( function ( viewmodel, i ) {
				var keypaths = keypathsByIndex[i];

				keypaths.forEach( function ( keypath ) {
					viewmodel.set( keypath, array );
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

}( Anglebars ));