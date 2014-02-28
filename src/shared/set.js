define([
	'circular',
	'shared/get/_get',
	'shared/clearCache',
	'shared/notifyDependants',
	'Ractive/prototype/shared/replaceData'
], function (
	circular,
	get,
	clearCache,
	notifyDependants,
	replaceData
) {

	'use strict';

	// returns `true` if this operation results in a change
	function set ( ractive, keypath, value ) {
		var cached, previous, wrapped, evaluator;

		// If we're dealing with a wrapped value, try and use its reset method
		wrapped = ractive._wrapped[ keypath ];

		if ( wrapped && wrapped.reset && ( wrapped.get() !== value ) ) {
			wrapped.reset( value );
			value = wrapped.get();
		}

		// Update evaluator value. This may be from the evaluator itself, or
		// it may be from the wrapper that wraps an evaluator's result - it
		// doesn't matter
		if ( evaluator = ractive._evaluators[ keypath ] ) {
			evaluator.value = value;
		}

		cached = ractive._cache[ keypath ];
		previous = get( ractive, keypath );

		if ( value === cached && typeof value !== 'object' ) {
			return;
		}

		// update the model, if necessary
		if ( !evaluator && ( !wrapped || !wrapped.reset ) ) {
			replaceData( ractive, keypath, value );
		}

		// add this keypath to the list of changes
		ractive._changes.push( keypath );

		// clear the cache
		clearCache( ractive, keypath );
		notifyDependants( ractive, keypath );

		return true;
	}

	circular.set = set;

	return set;

});
