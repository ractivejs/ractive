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
	if ( childValue && typeof childValue !== 'object' && typeof childValue !== 'function') {
		throw new TypeError( 'data option must be an object or a function, "' + childValue + '" is not valid' );
	}

	// Very important, otherwise child instance can become
	// the default data object on Ractive or a component.
	// then ractive.set() ends up setting on the prototype!
	if ( !childValue && typeof parentValue !== 'function' ) {
		childValue = {};
	}

	return dispatch( parentValue, childValue );
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

		// allow parent return value to take precedence if
		// it is a function that returns non-POJO Model
		// and child is either not a function or does not return non-POJO
		if ( ( parentIsFn && parent.constructor !== Object ) && ( !childIsFn || child.constructor === Object ) ) {
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
