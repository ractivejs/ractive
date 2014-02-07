define([
	'registries/adaptors',
	'shared/adaptIfNecessary',
	'shared/get/getFromParent',
	'shared/get/FAILED_LOOKUP',
	'shared/get/FAILED_PARENT_LOOKUP'
], function (
	adaptorRegistry,
	adaptIfNecessary,
	getFromParent,
	FAILED_LOOKUP,
	FAILED_PARENT_LOOKUP
) {

	'use strict';

	var get, _get, retrieve;

	// TODO tidy up!


	get = function ( ractive, keypath ) {
		var value;

		// capture the dependency, if we're inside an evaluator
		if ( ractive._captured && !ractive._captured[ keypath ] ) {
			ractive._captured.push( keypath );
			ractive._captured[ keypath ] = true;
		}

		value = _get( ractive, keypath );

		// If the property doesn't exist on this viewmodel, we
		// can try going up a scope. This will create bindings
		// between parent and child if possible
		if ( value === FAILED_LOOKUP && value !== FAILED_PARENT_LOOKUP ) {
			value = getFromParent( ractive, keypath );
		}

		if ( value === FAILED_PARENT_LOOKUP ) {
			return;
		}

		return value;
	};

	_get = function ( ractive, keypath ) {
		var cache,
			cached,
			value,
			wrapped,
			evaluator;

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
		var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped, shouldClone;

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
				cacheMap.push( keypath );
			}
		}

		// If this property doesn't exist, we return a sentinel value
		// so that we know to query parent scope (if such there be)
		if ( typeof parentValue === 'object' && !( key in parentValue ) ) {
			return ractive._cache[ keypath ] = FAILED_LOOKUP;
		}

		value = parentValue[ key ];

		// If we end up wrapping this value with an adaptor, we
		// may need to try and clone it if it actually lives on
		// the prototype of this instance's `data`. Otherwise the
		// instance could end up manipulating data that doesn't
		// belong to it
		shouldClone = !parentValue.hasOwnProperty( key );

		// Do we have an adaptor for this value?
		value = adaptIfNecessary( ractive, keypath, value, false, shouldClone );

		// Update cache
		ractive._cache[ keypath ] = value;
		return value;
	};

	return get;

});
