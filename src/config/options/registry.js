import baseConfig from 'config/options/baseConfiguration';
import extendObject from 'utils/extend';
import create from 'utils/create'
import 'legacy';

export default function registryConfig ( config ) {

	config = extendObject( config, {
		preExtend: preExtend,
		postExtend: () => {},
		preInit: preInit,
		postInit: () => {},
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
