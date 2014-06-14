import baseConfig from 'config/options/baseConfiguration';
import match from 'utils/hashmapContentsMatch';
import wrap from 'utils/wrapMethod';
import extendObject from 'utils/extend';
import create from 'utils/create'
import 'legacy';

export default function registryConfig ( config ) {

	config = extendObject( config, {
		preExtend: preExtend,
		postExtend: () => {},
		preInit: preInit,
		postInit: config.postInit || ( function(){} ),
		resetValue: reset,
		find: find,
		findInstance: findInstance
	});

	var base = baseConfig( config ),
		assign = base.assign.bind( base );

	base.assign = function ( target, value ) {
		assign( target, value || {} );
	}

	return base;
}



function preExtend ( Parent, child, options ) {

	var name = this.name, registry, option = options[ name ];

	if( !this.useDefaults ) {
		child = child.constructor;
	} else {
		Parent = Parent.defaults;
	}

	registry = create( Parent[name] );


	for( let key in option ) {
		registry[ key ] = option[ key ];
	}

	child[ name ] = registry;

}


function preInit ( Parent, ractive, options ) {

	var name = this.name, registry, option = options[ name ];

	if( this.useDefaults ) {
		Parent = Parent.defaults;
	}

	registry = create( Parent[name] );


	for( let key in option ) {
		registry[ key ] = option[ key ];
	}

	ractive[ name ] = registry;

}

function find ( ractive, key ) {

	return recurseFind( ractive, r => r[ this.name ][ key ] );
}

function findInstance ( ractive, key ) {

	return recurseFind( ractive, r => r[ this.name ][ key ] ? r : void 0 );
}

function recurseFind( ractive, fn ) {

	var find, parent;

	if ( find = fn( ractive ) ) {
		return find;
	}

	if ( !ractive.isolated && ( parent = ractive._parent ) ) {
		return recurseFind( parent, fn );
	}

}
/*
function extend( target, parentValue, value ) {

	parentValue = getAddedKeys( parentValue );

	return dispatch( parentValue, value );
}

function init ( ractive, parentValue, value ) {

	var result = extend( ractive, parentValue, value );

	if ( typeof result === 'function' ) {

		// store for reset
		ractive._config[ this.name ] = result;

		result = getDynamicValue( ractive, result );
	}

	return result;
}
*/
function reset ( ractive ) {

	var initial, result,
		fn = ractive._config[ this.name ];

	if( !fn) { return; }

	// initial = ractive[ this.name ];
	// result = getDynamicValue ( ractive, fn )

	// if ( !match( initial, result ) ) {
	// 	return result;
	// }

}
/*
function getDynamicValue ( ractive, fn ) {

	var temp = {},
		result = fn.call( ractive, temp, ractive.data );

	//normalize: returned result, keys added, or both
	copy( result, temp );

	return temp;
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

function fill ( from, to ) {
	return copy( from, to, true );
}

function fromProperties ( child, parent ) {

	var result = {};

	if ( child ) {
		copy( child, result );
	}

	if ( parent ) {
		fill( parent, result );
	}

	return result;
}

function fromFn ( child, parentFn ) {

	return function( registry ){
		// call the parent fn, use registry if no return value
		var result = parentFn.apply( this, arguments ) || registry;

		// extend with child
		if ( child ) {
			result = fromProperties( child, result );
		}

		return result;
	};
}

function extendFn ( childFn, parent ) {

	var parentFn;

	if( typeof parent !== 'function' ) {

		// don't bother with missing or {}
		if ( parent && Object.keys( parent ).length ) {

			// copy props to registry
			parentFn = function ( registry ) {
				copy ( parent, registry );
			};
		} else {
			// no-op if childFn needs it
			parentFn = () => {};
		}

	} else {

		parentFn = function(  registry ) {
			// give parent function it's own this context
			// otherwise this._super is from child and
			// causes infinite loop
			parent = wrap( parent, () => {}, true );

			var result =  parent.apply( this, arguments );

			// if result returned, copy to registry
			if( result ) {
				copy( result, registry );
			}
		};

	}

	return wrap( childFn, parentFn );
}
*/
