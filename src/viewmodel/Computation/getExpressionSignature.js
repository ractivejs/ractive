import { defineProperty } from 'utils/object';
import getFunctionFromString from 'shared/getFunctionFromString';

var bind = Function.prototype.bind;

export default function getExpressionSignature( signature, models, thisArg ){

	var fn, signature;

	fn = getFunctionFromString( signature, models.length );

	return {
		deps: models,
		getter () {
			var args = models.map( model => {
				var value = model.get( { fullRootGet: true } );
				if ( typeof value === 'function' ) {
					value = wrapFunction( value, thisArg );
				}
				return value;
			});
			return fn.apply( null, args );
		}
	};
}

function wrapFunction ( fn, ractive ) {
	var wrapped, prop, key;

	if ( fn.__ractive_nowrap ) {
		return fn;
	}

	prop = '__ractive_' + ractive._guid;
	wrapped = fn[ prop ];

	if ( wrapped ) {
		return wrapped;
	}

	else if ( /this/.test( fn.toString() ) ) {
		defineProperty( fn, prop, {
			value: bind.call( fn, ractive ),
			configurable: true
		});

		// Add properties/methods to wrapped function
		for ( key in fn ) {
			if ( fn.hasOwnProperty( key ) ) {
				fn[ prop ][ key ] = fn[ key ];
			}
		}

		ractive._boundFunctions.push({
			fn: fn,
			prop: prop
		});

		return fn[ prop ];
	}

	defineProperty( fn, '__ractive_nowrap', {
		value: fn
	});

	return fn.__ractive_nowrap;
}
