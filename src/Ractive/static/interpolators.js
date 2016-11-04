import { hasOwn } from '../../utils/object';
import { isArray, isObject, isNumeric } from '../../utils/is';
import interpolate from '../../shared/interpolate';

function snap ( to ) {
	return () => to;
}

const interpolators = {
	number ( from, to ) {
		let delta;

		if ( !isNumeric( from ) || !isNumeric( to ) ) {
			return null;
		}

		from = +from;
		to = +to;

		delta = to - from;

		if ( !delta ) {
			return function () { return from; };
		}

		return function ( t ) {
			return from + ( t * delta );
		};
	},

	array ( from, to ) {
		let intermediate, interpolators, len, i;

		if ( !isArray( from ) || !isArray( to ) ) {
			return null;
		}

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
			let i = len;

			while ( i-- ) {
				intermediate[i] = interpolators[i]( t );
			}

			return intermediate;
		};
	},

	object ( from, to ) {
		let properties, len, interpolators, intermediate, prop;

		if ( !isObject( from ) || !isObject( to ) ) {
			return null;
		}

		properties = [];
		intermediate = {};
		interpolators = {};

		for ( prop in from ) {
			if ( hasOwn.call( from, prop ) ) {
				if ( hasOwn.call( to, prop ) ) {
					properties.push( prop );
					interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] ) || snap( to[ prop ] );
				}

				else {
					intermediate[ prop ] = from[ prop ];
				}
			}
		}

		for ( prop in to ) {
			if ( hasOwn.call( to, prop ) && !hasOwn.call( from, prop ) ) {
				intermediate[ prop ] = to[ prop ];
			}
		}

		len = properties.length;

		return function ( t ) {
			let i = len, prop;

			while ( i-- ) {
				prop = properties[i];

				intermediate[ prop ] = interpolators[ prop ]( t );
			}

			return intermediate;
		};
	}
};

export default interpolators;
