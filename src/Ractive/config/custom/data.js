var dataConfigurator = {
	name: 'data',

	extend: ( Parent, proto, options ) => {
		proto.data = combine( Parent, proto, options );
	},

	init: ( Parent, ractive, options ) => {
		var result = combine( Parent, ractive, options );

		if ( typeof result === 'function' ) {
			result = result.call( ractive );
		}

		return result || {};
	},

	reset: function ( ractive ) {
		var result = this.init( ractive.constructor, ractive, ractive.viewmodel );

		if ( result ) {
			ractive.viewmodel.data = result;
			ractive.viewmodel.clearCache( '' );
			return true;
		}
	}
};

export default dataConfigurator;

function combine ( Parent, target, options ) {
	var value = options.data,
		parentValue = getAddedKeys( Parent.prototype.data );

	if ( value && typeof value !== 'object' && typeof value !== 'function') {
		throw new TypeError( 'data option must be an object or a function, "' + value + '" is not valid' );
	}

	// Very important, otherwise child instance can become
	// the default data object on Ractive or a component.
	// then ractive.set() ends up setting on the prototype!
	if ( !value && typeof parentValue !== 'function' ) {
		value = {};
	}

	return dispatch( parentValue, value );
}

function getAddedKeys ( parent ) {
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
	var parentIsFn = typeof parent === 'function',
		childIsFn = typeof child === 'function';

	if( !parentIsFn && !childIsFn ) {
		return fromProperties( child, parent );
	}

	return function(){
		child = childIsFn ? child.call( this ) : child,
		parent = parentIsFn ? parent.call(this) : parent;

		// prefer a function object to a literal
		if ( parentIsFn && !childIsFn ) {
			return fromProperties( parent, child, true );
		}
		else {
			return fromProperties( child, parent );
		}
	};
}

function fromProperties ( from, to, force ) {
	if ( !from ) { return to; }
	if ( !to ) { return from; }
	if ( !to && !from ) { return; }
	copy( to, from, force );
	return from;
}

function copy ( from, to, force ) {
	for ( let key in from ) {
		if ( force || !( key in to ) ) {
			to[ key ] = from[ key ];
		}
	}
}
