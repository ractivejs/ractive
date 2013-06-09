var getPartialDescriptor = function ( root, name ) {
	var el;

	if ( root.partials && root.partials[ name ] ) {
		return root.partials[ name ];
	}

	if ( Ractive.partials[ name ] ) {
		return Ractive.partials[ name ];
	}

	el = doc.getElementById( name );
	if ( el && el.tagName === 'SCRIPT' ) {
		if ( !Ractive.parse ) {
			throw new Error( missingParser );
		}

		Ractive.partials[ name ] = Ractive.parse( el.innerHTML );
		return Ractive.partials[ name ];
	}

	if ( root.debug && console && console.warn ) {
		console.warn( 'Could not find descriptor for partial "' + name + '"' );
	}

	return [];
};