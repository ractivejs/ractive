define([
	'utils/isObject',
	'Ractive/prototype/observe/getObserverFacade'
], function (
	isObject,
	getObserverFacade
) {

	'use strict';

	return function observe ( keypath, callback, options ) {

		var observers = [], k;

		if ( isObject( keypath ) ) {
			options = callback;

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					callback = keypath[k];
					observers[ observers.length ] = getObserverFacade( this, k, callback, options );
				}
			}

			return {
				cancel: function () {
					while ( observers.length ) {
						observers.pop().cancel();
					}
				}
			};
		}

		return getObserverFacade( this, keypath, callback, options );
	};

});

