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

		getPartialFromRegistry,
		unpack;


	getPartialDescriptor = function ( root, name ) {
		var el, partial;

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

				partials[ name ] = parse( el.innerHTML );
			}
		}

		partial = partials[ name ];

		// No match? Return an empty array
		if ( !partial ) {
			if ( root.debug ) {
				warn( 'Could not find descriptor for partial "' + name + '"' );
			}

			return [];
		}

		return unpack( partial );
	};

	getPartialFromRegistry = function ( registry, name ) {
		var partial, key;

		if ( registry.partials[ name ] ) {
			
			// If this was added manually to the registry, but hasn't been parsed,
			// parse it now
			if ( typeof registry.partials[ name ] === 'string' ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}

				partial = parse( registry.partials[ name ], registry.parseOptions );

				if ( isObject( partial ) ) {
					registry.partials[ name ] = partial.main;

					for ( key in partial.partials ) {
						if ( partial.partials.hasOwnProperty( key ) ) {
							registry.partials[ key ] = partial.partials[ key ];
						}
					}
				} else {
					registry.partials[ name ] = partial;
				}
			}

			return unpack( registry.partials[ name ] );
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