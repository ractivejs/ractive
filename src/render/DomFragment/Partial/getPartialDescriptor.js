define([
	'config/errors',
	'config/isClient',
	'utils/warn',
	'utils/isObject',
	'registries/partials',
	'parse/_parse'
], function (
	errors,
	isClient,
	warn,
	isObject,
	partials,
	parse
) {

	'use strict';

	var getPartialDescriptor,

		registerPartial,
		getPartialFromRegistry,
		unpack;


	getPartialDescriptor = function ( root, name ) {
		var el, partial, errorMessage;

		// If the partial was specified on this instance, great
		if ( partial = getPartialFromRegistry( root, name ) ) {
			return partial;
		}

		// Does it exist on the page as a script tag?
		if ( isClient ) {
			el = document.getElementById( name );
			if ( el && el.tagName === 'SCRIPT' ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}

				registerPartial( parse( el.innerHTML ), name, partials );
			}
		}

		partial = partials[ name ];

		// No match? Return an empty array
		if ( !partial ) {
			errorMessage = 'Could not find descriptor for partial "' + name + '"';

			if ( root.debug ) {
				throw new Error( errorMessage );
			} else {
				warn( errorMessage );
			}

			return [];
		}

		return unpack( partial );
	};

	getPartialFromRegistry = function ( registryOwner, name ) {
		var partial;

		if ( registryOwner.partials[ name ] ) {

			// If this was added manually to the registry, but hasn't been parsed,
			// parse it now
			if ( typeof registryOwner.partials[ name ] === 'string' ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}

				partial = parse( registryOwner.partials[ name ], registryOwner.parseOptions );
				registerPartial( partial, name, registryOwner.partials );
			}

			return unpack( registryOwner.partials[ name ] );
		}
	};

	registerPartial = function ( partial, name, registry ) {
		var key;

		if ( isObject( partial ) ) {
			registry[ name ] = partial.main;

			for ( key in partial.partials ) {
				if ( partial.partials.hasOwnProperty( key ) ) {
					registry[ key ] = partial.partials[ key ];
				}
			}
		} else {
			registry[ name ] = partial;
		}
	};

	unpack = function ( partial ) {
		// Unpack string, if necessary
		if ( partial.length === 1 && typeof partial[0] === 'string' ) {
			return partial[0];
		}

		return partial;
	};

	return getPartialDescriptor;

});