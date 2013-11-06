define([
	'utils/isArray',
	'utils/isObject',
	'utils/isNumeric'
], function (
	isArray,
	isObject,
	isNumeric
) {
	
	'use strict';

	// TODO short circuit values that stay the same
	// TODO make this plugin-able

	var interpolate = function ( from, to ) {
		if ( isNumeric( from ) && isNumeric( to ) ) {
			return makeNumberInterpolator( +from, +to );
		}

		if ( isArray( from ) && isArray( to ) ) {
			return makeArrayInterpolator( from, to );
		}

		if ( isObject( from ) && isObject( to ) ) {
			return makeObjectInterpolator( from, to );
		}

		return function () { return to; };
	};

	return interpolate;


	function makeNumberInterpolator ( from, to ) {
		var delta = to - from;

		if ( !delta ) {
			return function () { return from; };
		}

		return function ( t ) {
			return from + ( t * delta );
		};
	}

	function makeArrayInterpolator ( from, to ) {
		var intermediate, interpolators, len, i;

		intermediate = [];
		interpolators = [];

		i = len = Math.min( from.length, to.length );
		while ( i-- ) {
			interpolators[i] = interpolate( from[i], to[i] );
		}

		// surplus values - don't interpolate, but don't exclude them either
		for ( i=len; i<from.length; i+=1 ) {
			intermediate[i] = from[i];
		}

		for ( i=len; i<to.length; i+=1 ) {
			intermediate[i] = to[i];
		}

		return function ( t ) {
			var i = len;

			while ( i-- ) {
				intermediate[i] = interpolators[i]( t );
			}

			return intermediate;
		};
	}

	function makeObjectInterpolator ( from, to ) {
		var properties = [], len, interpolators, intermediate, prop;

		intermediate = {};
		interpolators = {};

		for ( prop in from ) {
			if ( from.hasOwnProperty( prop ) ) {
				if ( to.hasOwnProperty( prop ) ) {
					properties[ properties.length ] = prop;
					interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] );
				}

				else {
					intermediate[ prop ] = from[ prop ];
				}
			}
		}

		for ( prop in to ) {
			if ( to.hasOwnProperty( prop ) && !from.hasOwnProperty( prop ) ) {
				intermediate[ prop ] = to[ prop ];
			}
		}

		len = properties.length;

		return function ( t ) {
			var i = len, prop;

			while ( i-- ) {
				prop = properties[i];

				intermediate[ prop ] = interpolators[ prop ]( t );
			}

			return intermediate;
		};
	}

});