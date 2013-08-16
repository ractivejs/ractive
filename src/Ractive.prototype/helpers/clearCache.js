clearCache = function ( ractive, keypath ) {
	var value, cacheMap, childKeypath, wrappedProperty;

	// is this a modified array, which shouldn't fire set events on this keypath anymore?
	if ( ractive.modifyArrays ) {
		if ( keypath.charAt( 0 ) !== '(' ) { // expressions (and their children) don't get wrapped
			value = ractive._cache[ keypath ];
			if ( isArray( value ) && !value._ractive.setting ) {
				unregisterKeypathFromArray( value, keypath, ractive );
			}
		}
	}
	
	ractive._cache[ keypath ] = UNSET;

	if ( cacheMap = ractive._cacheMap[ keypath ] ) {
		while ( cacheMap.length ) {
			childKeypath = cacheMap.pop();

			clearCache( ractive, childKeypath );

			// unwrap properties
			wrappedProperty = ractive._wrapped[ childKeypath ];

			if ( wrappedProperty ) {
				wrappedProperty.teardown();
			}

			ractive._wrapped[ childKeypath ] = null;
		}
	}
};