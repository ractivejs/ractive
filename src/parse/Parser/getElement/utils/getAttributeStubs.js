define([
	'parse/Parser/getStringFragment/_getStringFragment'
], function (
	getStringFragment
) {

	'use strict';

	return function ( attributes ) {
		var a;

		a = {};

		attributes.forEach( function ( attribute ) {
			var value;

			// TODO use 0 instead of null
			if ( attribute.value ) {
				value = getStringFragment( attribute.value );

				if ( value.length === 1 && typeof value[0] === 'string' ) {
					value = value[0];
				}
			} else {
				value = null;
			}

			a[ attribute.name ] = value;
		});

		return a;
	};

});
