import initOptions from 'config/initOptions';
import defineProperty from 'utils/defineProperty';
import defineProperties from 'utils/defineProperties';
import registries from 'config/registries/registries';

var configuration = {

	extend: function ( Parent, Child, options ) {

		var defaults = initOptions.keys.reduce( (val, key) => {
			val[ key ] = options[ key ] || Parent.defaults[ key ];
			return val;
		}, {});

		configure( this, Child, defaults, registry => {
			registry.extend( Parent, Child, options );
		});

	},

	init: function ( Parent, ractive, options ) {

		// storage for item config to use,
		// like store functions or original values
		defineProperty( ractive, '_config', { value: {} } );

		//flags

		registries.forEach( registry => {
			registry.init( Parent, ractive, options );
		});

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

function configure( config, Target, defaults, registryFn ) {

	defineProperties( Target, {
		defaults: 		{ value: defaults }
	});

	registries.forEach( registryFn );
}

export default configuration;
