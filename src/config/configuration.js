import initOptions from 'config/initOptions';
import defineProperty from 'utils/defineProperty';
import defineProperties from 'utils/defineProperties';
import registries from 'config/registries/registries';
import wrapMethod from 'extend/wrapMethod';
import augment from 'extend/utils/augment';
import create from 'utils/create';
import cssConfig from 'config/css/css';

//TODO move to initOptions
var blacklisted = registries.keys.concat( initOptions.keys ).concat( [ 'data', 'css', '_parent', '_component' ] ).reduce( ( hash, property ) => {

	hash[ property ] = true;
	return hash;

}, {} );

var configuration = {

	extend: function ( Parent, Child, options ) {

		var defaults = initOptions.keys.reduce( (val, key) => {

			var value = options[ key ], parentValue = Parent.defaults[ key ];

			if( initOptions.isFunction[ key ] &&  typeof parentValue === 'function' ){
				val[ key ] = wrapMethod( value, parentValue ) || null;
			}
			else {
				val[ key ] = options[ key ] || Parent.defaults[ key ];
			}

			return val;

		}, {});

		defineProperties( Child, {
			defaults: 		{ value: defaults }
		});

		todo_data( Parent, Child, options.data );


		registries.forEach( registry => {
			registry.extend( Parent, Child, options );
		} );

		cssConfig.extend( Parent, Child, options );

		for ( let key in options ) {

			if ( !blacklisted[ key ] && options.hasOwnProperty( key ) ) {

				let member = options[ key ]

				// if this is a method that overwrites a method, wrap it:
				if ( typeof member === 'function' ) {
					member = wrapMethod( member, Child.prototype[ key ] );
				}

				Child.prototype[ key ] = member;

			}
		}
	},

	init: function ( Parent, ractive, options ) {


		//flags

		registries.forEach( registry => {
			registry.init( Parent, ractive, options );
		});

		for ( let key in options ) {
			if ( !blacklisted[ key ] && options.hasOwnProperty( key ) ) {

				let member = options[ key ],
					useDefaults = initOptions.useDefaults[ key ],
					parent = useDefaults ? Parent.defaults : Parent;

				// if this is a method that overwrites a method, wrap it:
				if ( typeof member === 'function' && typeof parent[ key ] === 'function' ) {
					member = wrapMethod( member, parent[ key ] );
				}

				ractive[ key ] = member;

			}
		}

	},

	reset: function ( ractive ) {

		// return names of changed items
		return registries.filter( registry => {

			return registry.reset( ractive );

		}).map( registry => {

			return registry.name;
		});

	},

	get: function ( name ) {

		return registries.find( registry => { return registry.name === name } );
	},

	find: function ( ractive, registryName, key ) {

		var item, parent;

		if ( item = ractive[ registryName ][ key ] ) {
			return item;
		}

		if ( parent = ractive._parent ) {
			return this.find( parent, registryName, key );
		}

	}

};

function todo_data( Parent, Child, value ){

	if ( value ) {
		if ( Child.data ) {
			augment( Child.data, value );
		} else {
			Child.data = value;
		}
	}

	if ( Parent.data ) {

		let value = Parent.data;

		if ( value ) {
			if ( Child.data ) {
				augment( Child.data, value );
			} else {
				Child.data = value;
			}
		}
	}

}

export default configuration;
