// TODO use dontNormalise

proto.get = function ( keypath, dontNormalise ) {
	var cache, keys, normalised, key, parentKeypath, parentValue, value;

	if ( !keypath ) {
		return this.data;
	}

	cache = this._cache;

	if ( isArray( keypath ) ) {
		keys = keypath.slice(); // clone
		normalised = keys.join( '.' );
	}

	else {
		// cache hit? great
		if ( cache.hasOwnProperty( keypath ) && cache[ keypath ] !== UNSET ) {
			return cache[ keypath ];
		}

		keys = splitKeypath( keypath );
		normalised = keys.join( '.' );
	}

	// we may have a cache hit now that it's been normalised
	if ( cache.hasOwnProperty( normalised ) && cache[ normalised ] !== UNSET ) {
		return cache[ normalised ];
	}

	// is this an uncached evaluator value?
	if ( this._evaluators[ normalised ] ) {
		value = this._evaluators[ normalised ].value;
		cache[ normalised ] = value;
		return value;
	}

	// otherwise it looks like we need to do some work
	key = keys.pop();
	parentValue = ( keys.length ? this.get( keys ) : this.data );

	if ( parentValue === null || typeof parentValue !== 'object' || parentValue === UNSET ) {
		return;
	}

	value = parentValue[ key ];

	// Is this an array that needs to be wrapped?
	if ( this.modifyArrays ) {
		// if it's not an expression, is an array, and we're not here because it sent us here, wrap it
		if ( ( normalised.charAt( 0 ) !== '(' ) && isArray( value ) && ( !value._ractive || !value._ractive.setting ) ) {
			registerKeypathToArray( value, normalised, this );
		}
	}

	// Update cache
	cache[ normalised ] = value;
	
	return value;
};