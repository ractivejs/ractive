import create from 'utils/create';
import wrap from 'utils/wrapMethod';

var dataConfig = {
	name: 'data',
	extend: extend,
	init: init,
	reset: reset
};

export default dataConfig;

function combine( Parent, target, options ) {

	var value = options.data || {},
		parentValue = getAddedKeys( Parent.prototype.data );

	return dispatch( parentValue, value );
}


function extend( Parent, proto, options ) {

	proto.data = combine( Parent, proto, options );
}

function init ( Parent, ractive, options ) {

	var value = options.data,
		result = combine( Parent, ractive, options );

	if ( typeof result === 'function' ) {

		result = result.call( ractive, value ) || value;
	}

	return ractive.data = result || {};
}

function reset ( ractive ) {

	var result = this.init( ractive.constructor, ractive, ractive );

	if ( result ) {
		ractive.data = result;
		return true;
	}

}

function getAddedKeys( parent ) {

	// only for functions that had keys added
	if ( typeof parent !== 'function' || !Object.keys( parent ).length ) { return parent; }

	// copy the added keys to temp 'object', otherwise
	// parent would be interpreted as 'function' by dispatch
	let temp = {};
	copy( parent, temp );

	// roll in added keys
	return dispatch( parent, temp );
}

function dispatch ( parent, child ) {

	if ( typeof child === 'function' ) {

		return extendFn( child, parent );

	} else if ( typeof parent === 'function' ){

		return fromFn( child, parent );

	} else {

		return fromProperties( child, parent );
	}
}

function copy ( from, to, fillOnly ) {

	for ( let key in from ) {

		if ( fillOnly && key in to ) { continue; }

		to[ key ] = from[ key ];
	}
}

function fromProperties ( child, parent ) {

	child = child || {};

	if ( parent && Object.keys( parent ).length ) {

		// this is same as current ractive behavior
		// would like to revisit...
		parent = create( parent );
		copy( child, parent );
		child = parent;
	}

	return child;
}


function fromFn ( child, parentFn ) {

	return function( data ){

		var keys;

		if ( child ) {

			// Track the keys that our on the child,
			// but not on the data. We'll need to apply these
			// after the parent function returns
			keys = Object.keys( child );

			if ( data ) {

				keys = keys.filter( key => !( key in data ) );
			}
		}

		// call the parent fn, use data if no return value
		data = parentFn.call( this, data ) || data;

		// copy child keys back onto data
		if ( keys && keys.length ) {

			data = data || {};

			keys.forEach( key => {
				data[ key ] = child[ key ];
			});
		}

		return data;
	};
}

function extendFn ( childFn, parent ) {

	var parentFn;

	if( typeof parent !== 'function' ) {

		// copy props to data
		parentFn = function ( data ) {
			fromProperties ( data, parent );
		};

	} else {

		parentFn = function ( data ) {
			// give parent function it's own this._super context,
			// otherwise this._super is from child and
			// causes infinite loop
			parent = wrap( parent, () => {}, true );

			return parent.call( this, data ) || data;
		};

	}

	return wrap( childFn, parentFn );
}
