define([
	'utils/isNumeric'
], function (
	isNumeric
) {

	'use strict';

	return function ( root, keypath, d ) {
		var value;

		if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
			throw new Error( 'Bad arguments' );
		}

		value = +root.get( keypath ) || 0;

		if ( !isNumeric( value ) ) {
			throw new Error( 'Cannot add to a non-numeric value' );
		}

		return root.set( keypath, value + d );
	};

});
