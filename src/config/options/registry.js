import extendObject from 'utils/extend';
import create from 'utils/create'
import 'legacy';

export default function registryConfig ( config ) {

	config = extendObject( config, {
		extend: extend,
		init: init,
		configure: configure,
		find: find,
		findInstance: findInstance
	});

	return config;
}


function extend ( Parent, proto, options ) {

	this.configure( Parent, proto.constructor, options );

}

function init ( Parent, ractive, options ) {

	this.configure( Parent, ractive, options );

}


function configure ( Parent, target, options ) {

	var name = this.name,
		option = options[ name ],
		registry = create( Parent[name] );


	for( let key in option ) {
		registry[ key ] = option[ key ];
	}

	if ( this.post ) { registry = this.post( target, registry ); }

	target[ name ] = registry;

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
