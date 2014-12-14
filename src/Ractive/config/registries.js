import { create } from 'utils/object';
import 'legacy';

var registryNames, Registry, registries;

registryNames = [
	'adaptors',
	'components',
	'computed',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

Registry = function ( name, useDefaults ) {
	this.name = name;
	this.useDefaults = useDefaults;
};

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

		for ( let key in option ) {
			registry[ key ] = option[ key ];
		}

		target[ name ] = registry;
	},

	reset: function ( ractive ) {
		var registry = ractive[ this.name ];
		var changed = false;
		Object.keys( registry ).forEach( key => {
			var item = registry[key];
			if ( item._fn ) {
				if ( item._fn.isOwner ) {
					registry[key] = item._fn;
				} else {
					delete registry[key];
				}
				changed = true;
			}
		});
		return changed;
	}
};

registries = registryNames.map( name => new Registry( name, name === 'computed' ) );

export default registries;