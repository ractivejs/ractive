define([
	'circular',
	'utils/hasOwnProperty',
	'utils/clone',
	'shared/adaptIfNecessary',
	'shared/get/getFromParent',
	'shared/get/FAILED_LOOKUP'
], function (
	circular,
	hasOwnProperty,
	clone,
	adaptIfNecessary,
	getFromParent,
	FAILED_LOOKUP
) {

	'use strict';

	function get ( ractive, keypath, options ) {
		var cache = ractive._cache,
			value,
			computation,
			wrapped,
			evaluator;

		if ( cache[ keypath ] === undefined ) {

			// Is this a computed property?
			if ( computation = ractive._computations[ keypath ] ) {
				value = computation.value;
			}

			// Is this a wrapped property?
			else if ( wrapped = ractive._wrapped[ keypath ] ) {
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
		} else {
			value = cache[ keypath ];
		}

		// If the property doesn't exist on this viewmodel, we
		// can try going up a scope. This will create bindings
		// between parent and child if possible
		if ( value === FAILED_LOOKUP ) {
			if ( ractive._parent && !ractive.isolated ) {
				value = getFromParent( ractive, keypath, options );
			} else {
				value = undefined;
			}
		}

		if ( options && options.evaluateWrapped && ( wrapped = ractive._wrapped[ keypath ] ) ) {
			value = wrapped.get();
		}

		return value;
	}

	circular.get = get;
	return get;


	function retrieve ( ractive, keypath ) {
		var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped, shouldClone;

		keys = keypath.split( '.' );
		key = keys.pop();
		parentKeypath = keys.join( '.' );

		parentValue = get( ractive, parentKeypath );

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

		// If this value actually lives on the prototype of this
		// instance's `data`, and not as an own property, we need to
		// clone it. Otherwise the instance could end up manipulating
		// data that doesn't belong to it
		shouldClone = !hasOwnProperty.call( parentValue, key );
		value = shouldClone ? clone( parentValue[ key ] ) : parentValue[ key ];

		// Do we have an adaptor for this value?
		value = adaptIfNecessary( ractive, keypath, value, false );

		// Update cache
		ractive._cache[ keypath ] = value;
		return value;
	}

});
