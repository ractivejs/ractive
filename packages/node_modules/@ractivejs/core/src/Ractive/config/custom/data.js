import { fatal, warnIfDebug, warnOnceIfDebug } from '../../../utils/log';
import { isObject } from '../../../utils/is';
import bind from '../../../utils/bind';

function validate ( data ) {
	// Warn if userOptions.data is a non-POJO
	if ( data && data.constructor !== Object ) {
		if ( typeof data === 'function' ) {
			// TODO do we need to support this in the new Ractive() case?
		} else if ( typeof data !== 'object' ) {
			fatal( `data option must be an object or a function, \`${data}\` is not valid` );
		} else {
			warnIfDebug( 'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged' );
		}
	}
}

export default {
	name: 'data',

	extend: ( Parent, proto, options ) => {
		let key;
		let value;

		// check for non-primitives, which could cause mutation-related bugs
		if ( options.data && isObject( options.data ) ) {
			for ( key in options.data ) {
				value = options.data[ key ];

				if ( value && typeof value === 'object' ) {
					if ( isObject( value ) || Array.isArray( value ) ) {
						warnIfDebug( `Passing a \`data\` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:

  // this...
  data: function () {
    return {
      myObject: {}
    };
  })

  // instead of this:
  data: {
    myObject: {}
  }` );
					}
				}
			}
		}

		proto.data = combine( proto.data, options.data );
	},

	init: ( Parent, ractive, options ) => {
		let result = combine( Parent.prototype.data, options.data );

		if ( typeof result === 'function' ) result = result.call( ractive );

		// bind functions to the ractive instance at the top level,
		// unless it's a non-POJO (in which case alarm bells should ring)
		if ( result && result.constructor === Object ) {
			for ( const prop in result ) {
				if ( typeof result[ prop ] === 'function' ) {
					const value = result[ prop ];
					result[ prop ] = bind( value, ractive );
					result[ prop ]._r_unbound = value;
				}
			}
		}

		return result || {};
	},

	reset ( ractive ) {
		const result = this.init( ractive.constructor, ractive, ractive.viewmodel );
		ractive.viewmodel.root.set( result );
		return true;
	}
};

function combine ( parentValue, childValue ) {
	validate( childValue );

	const parentIsFn = typeof parentValue === 'function';
	const childIsFn = typeof childValue === 'function';

	// Very important, otherwise child instance can become
	// the default data object on Ractive or a component.
	// then ractive.set() ends up setting on the prototype!
	if ( !childValue && !parentIsFn ) {
		childValue = {};
	}

	// Fast path, where we just need to copy properties from
	// parent to child
	if ( !parentIsFn && !childIsFn ) {
		return fromProperties( childValue, parentValue );
	}

	return function () {
		const child = childIsFn ? callDataFunction( childValue, this ) : childValue;
		const parent = parentIsFn ? callDataFunction( parentValue, this ) : parentValue;

		return fromProperties( child, parent );
	};
}

function callDataFunction ( fn, context ) {
	const data = fn.call( context );

	if ( !data ) return;

	if ( typeof data !== 'object' ) {
		fatal( 'Data function must return an object' );
	}

	if ( data.constructor !== Object ) {
		warnOnceIfDebug( 'Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged' );
	}

	return data;
}

function fromProperties ( primary, secondary ) {
	if ( primary && secondary ) {
		for ( const key in secondary ) {
			if ( !( key in primary ) ) {
				primary[ key ] = secondary[ key ];
			}
		}

		return primary;
	}

	return primary || secondary;
}
