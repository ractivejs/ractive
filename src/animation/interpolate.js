Ractive.interpolate = function ( from, to ) {
	if ( utils.isNumeric( from ) && utils.isNumeric( to ) ) {
		return Ractive.interpolators.number( +from, +to );
	}

	if ( utils.isArray( from ) && utils.isArray( to ) ) {
		return Ractive.interpolators.array( from, to );
	}

	if ( utils.isObject( from ) && utils.isObject( to ) ) {
		return Ractive.interpolators.object( from, to );
	}

	return function () { return to; };
};