// TODO use dontNormalise
// TODO refactor this shitball

proto.get = function ( keypath ) {
	var cache, cacheMap, keys, normalised, key, parentKeypath, parentValue, value, ignoreUndefined;

	if ( !keypath ) {
		return this.data;
	}

	cache = this._cache;

	if ( isArray( keypath ) ) {
		if ( !keypath.length ) {
			return this.data;
		}

		keys = keypath.slice(); // clone
		normalised = keys.join( '.' );

		ignoreUndefined = true; // because this should be a branch, sod the cache
	}

	else {
		// cache hit? great
		if ( hasOwn.call( cache, keypath ) && cache[ keypath ] !== UNSET ) {
			return cache[ keypath ];
		}

		keys = splitKeypath( keypath );
		normalised = keys.join( '.' );
	}

	// we may have a cache hit now that it's been normalised
	if ( hasOwn.call( cache, normalised ) && cache[ normalised ] !== UNSET ) {
		if ( cache[ normalised ] === undefined && ignoreUndefined ) {
			// continue
		} else {
			return cache[ normalised ];
		}
	}

	// is this an uncached evaluator value?
	if ( this._evaluators[ normalised ] ) {
		value = this._evaluators[ normalised ].value;
		cache[ normalised ] = value;
		return value;
	}

	// otherwise it looks like we need to do some work
	key = keys.pop();
	parentKeypath = keys.join( '.' );
	parentValue = ( keys.length ? this.get( keys ) : this.data );

	if ( parentValue === null || typeof parentValue !== 'object' || parentValue === UNSET ) {
		return;
	}

	// update cache map
	if ( !( cacheMap = this._cacheMap[ parentKeypath ] ) ) {
		this._cacheMap[ parentKeypath ] = [ normalised ];
	} else {
		if ( cacheMap.indexOf( normalised ) === -1 ) {
			cacheMap[ cacheMap.length ] = normalised;
		}
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