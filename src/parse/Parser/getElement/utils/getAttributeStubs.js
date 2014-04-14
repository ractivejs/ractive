define([
	'parse/Parser/StringStub/_StringStub'
], function (
	StringStub
) {

	'use strict';

	return function ( attributes ) {
		var a;

		a = {};

		attributes.forEach( function ( attribute ) {
			var value;

			// TODO deprecate StringStub, use 0 instead of null
			if ( attribute.value ) {
				value = new StringStub( attribute.value ).toJSON();

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
