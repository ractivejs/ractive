define([
	'utils/normaliseKeypath',
	'registries/adaptors',
	'shared/adaptIfNecessary',
	'Ractive/prototype/get/arrayAdaptor',
	'Ractive/prototype/get/magicAdaptor'
], function (
	normaliseKeypath,
	adaptorRegistry,
	adaptIfNecessary,
	arrayAdaptor,
	magicAdaptor
) {

	'use strict';

	var get, _get, retrieve;


	// all the logic sits in a private function, so we can do _get even when
	// ractive.get() has been overridden (i.e. by an evaluator, to do intercepts)
	get = function ( keypath ) {
		return _get( this, keypath );
	};

	_get = function ( ractive, keypath ) {
		var cache,
			cached,
			value,
			wrapped,
			evaluator;

		// Normalise the keypath (i.e. list[0].foo -> list.0.foo)
		keypath = normaliseKeypath( keypath || '' );

		cache = ractive._cache;

		if ( ( cached = cache[ keypath ] ) !== undefined ) {
			return cached;
		}

		// Is this a wrapped property?
		if ( wrapped = ractive._wrapped[ keypath ] ) {
			value = wrapped.value;
		}

		// Is it the root?
		else if ( !keypath ) {
			adaptIfNecessary( ractive, '', ractive.data );
			value = ractive.data;
		}

		// Is this an uncached evaluator value?
		else if ( evaluator = ractive._evaluators[ keypath ] ) {
			value = evaluator.value;
		}

		// No? Then we need to retrieve the value one key at a time
		else {
			value = retrieve( ractive, keypath );
		}

		cache[ keypath ] = value;
		return value;
	};


	retrieve = function ( ractive, keypath ) {
		var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped;

		keys = keypath.split( '.' );
		key = keys.pop();
		parentKeypath = keys.join( '.' );

		parentValue = _get( ractive, parentKeypath );

		if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
			parentValue = wrapped.get();
		}

		if ( parentValue === null || parentValue === undefined ) {
			return;
		}

		// update cache map
		if ( !( cacheMap = ractive._cacheMap[ parentKeypath ] ) ) {
			ractive._cacheMap[ parentKeypath ] = [ keypath ];
		} else {
			if ( cacheMap.indexOf( keypath ) === -1 ) {
				cacheMap[ cacheMap.length ] = keypath;
			}
		}


		value = parentValue[ key ];


		// Do we have an adaptor for this value?
		if ( adaptIfNecessary( ractive, keypath, value ) ) {
			return value;
		}


		// If we're in 'magic' mode, wrap this object
		if ( ractive.magic ) {
			ractive._wrapped[ keypath ] = magicAdaptor.wrap( ractive, value, keypath );
		}

		// Should we use the in-built adaptor for plain arrays?
		if ( ractive.modifyArrays ) {
			if ( arrayAdaptor.filter( ractive, value, keypath ) ) {
				ractive._wrapped[ keypath ] = arrayAdaptor.wrap( ractive, value, keypath );
			}
		}

		// Update cache
		ractive._cache[ keypath ] = value;
		return value;
	};

	return get;

});