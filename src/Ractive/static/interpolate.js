define([
	'utils/isArray',
	'utils/isObject',
	'utils/isNumeric',
	'Ractive/static/interpolators'
], function (
	isArray,
	isObject,
	isNumeric,
	interpolators
) {
	
	'use strict';

	// TODO short circuit values that stay the same
	// TODO make this plugin-able

	return function ( from, to ) {
		if ( isNumeric( from ) && isNumeric( to ) ) {
			return interpolators.number( +from, +to );
		}

		if ( isArray( from ) && isArray( to ) ) {
			return interpolators.array( from, to );
		}

		if ( isObject( from ) && isObject( to ) ) {
			return interpolators.object( from, to );
		}

		return function () { return to; };
	};

});