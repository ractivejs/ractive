import { fatal, warn } from 'utils/log';

function validate ( data ) {
	// Warn if userOptions.data is a non-POJO
	if ( data && data.constructor !== Object ) {
		if ( typeof data === 'function' ) {
			// TODO do we need to support this in the new Ractive() case?
		} else if ( typeof data !== 'object' ) {
			fatal( `data option must be an object or a function, \`${data}\` is not valid` );
		} else {
			warn( 'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged' );
		}
	}
}

var dataConfigurator = {
	name: 'data',

	extend: ( Parent, proto, options ) => {
		proto.data = combine( proto.data, options.data );
	},

	init: ( Parent, ractive, options ) => {
		var result = combine( Parent.prototype.data, options.data );

		if ( typeof result === 'function' ) {
			result = result.call( ractive );
		}

		return result || {};
	},

	reset: function ( ractive ) {
		var result = this.init( ractive.constructor, ractive, ractive.viewmodel );

		ractive.viewmodel.reset( result );
		return true;
	}
};

export default dataConfigurator;

function combine ( parentValue, childValue ) {
	validate( childValue );

	let parentIsFn = typeof parentValue === 'function';
	let childIsFn = typeof childValue === 'function';

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
		let child = childIsFn ? childValue.call( this ) : childValue;
		let parent = parentIsFn ? parentValue.call( this ) : parentValue;

		return fromProperties( child, parent );
	};
}

function fromProperties ( primary, secondary ) {
	if ( primary && secondary ) {
		for ( let key in secondary ) {
			if ( !( key in primary ) ) {
				primary[ key ] = secondary[ key ];
			}
		}

		return primary;
	}

	return primary || secondary;
}
