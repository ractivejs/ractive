define([ 'config/isClient' ], function ( isClient ) {

	'use strict';

	try {
		Object.defineProperty({}, 'test', { value: 0 });

		if ( isClient ) {
			Object.defineProperty( document.createElement( 'div' ), 'test', { value: 0 });
		}

		return Object.defineProperty;
	} catch ( err ) {
		// Object.defineProperty doesn't exist, or we're in IE8 where you can
		// only use it with DOM objects (what the fuck were you smoking, MSFT?)
		return function ( obj, prop, desc ) {
			obj[ prop ] = desc.value;
		};
	}

});