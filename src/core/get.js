proto.get = function ( keypath, dontNormalise ) {
	var keys, normalised, key, match, parentKeypath, parentValue, value;

	if ( !keypath ) {
		return this.data;
	}

	if ( utils.isArray( keypath ) ) {
		keys = keypath.slice(); // clone
		normalised = keys.join( '.' );
	}

	else {
		// cache hit? great
		if ( this._cache.hasOwnProperty( keypath ) ) {
			return this._cache[ keypath ];
		}

		keys = utils.splitKeypath( keypath );
		normalised = keys.join( '.' );
	}

	// we may have a cache hit now that it's been normalised
	if ( this._cache.hasOwnProperty( normalised ) ) {
		return this._cache[ normalised ];
	}

	// otherwise it looks like we need to do some work
	key = keys.pop();
	parentValue = ( keys.length ? this.get( keys ) : this.data );

	if ( typeof parentValue !== 'object' || !parentValue.hasOwnProperty( key ) ) {
		return;
	}

	value = parentValue[ key ];

	// update map of dependants
	parentKeypath = keys.join( '.' );

	if ( !this._depsMap[ parentKeypath ] ) {
		this._depsMap[ parentKeypath ] = [];
	}

	// TODO is this check necessary each time?
	if ( this._depsMap[ parentKeypath ].indexOf( normalised ) === -1 ) {
		this._depsMap[ parentKeypath ].push( normalised );
	}

	// Is this an array that needs to be wrapped?
	if ( this.modifyArrays ) {
		if ( utils.isArray( value ) && ( !value.ractive || !value._ractive.setting ) ) {
			utils.addKeypath( value, normalised, this );
		}
	}

	// Update cache
	this._cache[ normalised ] = value;
	
	return value;
};