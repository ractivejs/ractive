import wrapPrototype from 'utils/wrapPrototypeMethod';
import wrap from 'utils/wrapMethod';
import config from 'config/config';
import circular from 'circular';

var Ractive,
	// would be nice to not have these here,
	// they get added during initialise, so for now we have
	// to make sure not to try and extend them.
	// Possibly, we could re-order and not add till later
	// in process.
	blacklisted = {
		'_parent' : true,
		'_component' : true
	},
	childOptions = {
		toPrototype: toPrototype,
		toOptions: toOptions
	},
	registries = config.registries;

config.keys.forEach( key => blacklisted[ key ] = true );

circular.push( function () {
	Ractive = circular.Ractive;
});

export default childOptions;

function toPrototype ( parent, proto, options ) {
	for ( let key in options ) {
		if ( !( key in blacklisted ) && options.hasOwnProperty( key ) ) {
			let member = options[ key ];

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				member = wrapPrototype( parent, key, member );
			}

			proto[ key ] = member;
		}
	}
}

function toOptions ( Child ) {
	if ( !( Child.prototype instanceof Ractive ) ) { return Child; }

	let options = {};

	while ( Child ) {
		registries.forEach( r => {
			addRegistry(
				r.useDefaults ? Child.prototype : Child,
				options, r.name );
		});

		Object.keys( Child.prototype ).forEach( key => {
			if ( key === 'computed' ) { return; }

			var value = Child.prototype[ key ];

			if ( !( key in options ) ) {
				options[ key ] = value._method ? value._method : value;
			}

			// is it a wrapped function?
			else if ( typeof options[ key ] === 'function'
					&& typeof value === 'function'
					&& options[ key ]._method ) {

				let result, needsSuper = value._method;

				if( needsSuper ) { value = value._method; }

				// rewrap bound directly to parent fn
				result = wrap( options[ key ]._method, value );


				if( needsSuper ) { result._method = result; }

				options[ key ] = result;
			}
		});

		if( Child._parent !== Ractive ) {
			Child = Child._parent;
		} else {
			Child = false;
		}
	}

	return options;
}

function addRegistry ( target, options, name ) {
	var registry, keys = Object.keys( target[ name ] );

	if ( !keys.length ) { return; }

	if ( !( registry = options[ name ] ) ) {
		registry = options[ name ] = {};
	}

	keys
		.filter( key => !( key in registry ) )
		.forEach( key => registry[ key ] = target[ name ][ key ] );
}
