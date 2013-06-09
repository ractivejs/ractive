var getPartialDescriptor = function ( root, name ) {
	var el, partial;

	// If the partial was specified on this instance, great
	if ( root.partials && root.partials[ name ] ) {
		return root.partials[ name ];
	}

	// If not, is it a global partial?
	if ( Ractive.partials[ name ] ) {
		
		// If this was added manually to the registry, but hasn't been parsed,
		// parse it now
		if ( typeof Ractive.partials[ name ] === 'string' ) {
			if ( !Ractive.parse ) {
				throw new Error( missingParser );
			}

			Ractive.partials[ name ] = Ractive.parse( Ractive.partials[ name ] );
		}
	}

	// Does it exist on the page as a script tag?
	else {
		el = doc.getElementById( name );
		if ( el && el.tagName === 'SCRIPT' ) {
			if ( !Ractive.parse ) {
				throw new Error( missingParser );
			}

			Ractive.partials[ name ] = Ractive.parse( el.innerHTML );
		}
	}

	partial = Ractive.partials[ name ];

	// No match? Return an empty array
	if ( !partial ) {
		if ( root.debug && console && console.warn ) {
			console.warn( 'Could not find descriptor for partial "' + name + '"' );
		}

		return [];
	}

	// Unpack string, if necessary
	if ( partial.length === 1 && typeof partial[0] === 'string' ) {
		return partial[0];
	}

	return partial;
};