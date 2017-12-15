import { create, keys } from 'utils/object';

const registryNames = [
	'adaptors',
	'components',
	'computed',
	'decorators',
	'easing',
	'events',
	'helpers',
	'interpolators',
	'partials',
	'transitions'
];

const registriesOnDefaults = [
	'computed',
	'helpers'
];

class Registry {
	constructor ( name, useDefaults ) {
		this.name = name;
		this.useDefaults = useDefaults;
	}

	extend ( Parent, proto, options ) {
		const parent = this.useDefaults ? Parent.defaults : Parent;
		const target = this.useDefaults ? proto : proto.constructor;
		this.configure( parent, target, options );
	}

	init () {
		// noop
	}

	configure ( Parent, target, options ) {
		const name = this.name;
		const option = options[ name ];

		const registry = create( Parent[name] );

		for ( const key in option ) {
			registry[ key ] = option[ key ];
		}

		target[ name ] = registry;
	}

	reset ( ractive ) {
		const registry = ractive[ this.name ];
		let changed = false;

		keys( registry ).forEach( key => {
			const item = registry[ key ];

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
}

const registries = registryNames.map( name => {
	const putInDefaults = registriesOnDefaults.indexOf(name) > -1;
	return new Registry( name, putInDefaults );
});

export default registries;
