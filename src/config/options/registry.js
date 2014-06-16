import create from 'utils/create'
import 'legacy';

function Registry ( name, useDefaults ) {
	this.name = name;
	this.useDefaults = useDefaults;
}

Registry.prototype = {

	constructor: Registry,

 	extend: function ( Parent, proto, options ) {
		this.configure(
			this.useDefaults ? Parent.defaults : Parent,
			this.useDefaults ? proto : proto.constructor,
			options );
	},

	init: function ( Parent, ractive, options ) {
		this.configure(
			this.useDefaults ? Parent.defaults : Parent,
			ractive,
			options );
	},

	configure: function ( Parent, target, options ) {

		var name = this.name, option = options[ name ], registry;

		registry = create( Parent[name] );

		for( let key in option ) {
			registry[ key ] = option[ key ];
		}

		target[ name ] = registry;

	},

	find: function ( ractive, key ) {

		return recurseFind( ractive, r => r[ this.name ][ key ] );
	},

	findInstance: function ( ractive, key ) {

		return recurseFind( ractive, r => r[ this.name ][ key ] ? r : void 0 );
	}
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

export default Registry;
