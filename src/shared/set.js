define([
	'circular',
	'utils/isEqual',
	'utils/createBranch',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	circular,
	isEqual,
	createBranch,
	clearCache,
	notifyDependants
) {

	'use strict';

	var get;

	circular.push( function () {
		get = circular.get;
	});

	function set ( ractive, keypath, value, silent ) {
		var keys, lastKey, parentKeypath, parentValue, wrapper, evaluator, dontTeardownWrapper;

		if ( isEqual( ractive._cache[ keypath ], value ) ) {
			return;
		}

		wrapper = ractive._wrapped[ keypath ];
		evaluator = ractive._evaluators[ keypath ];

		if ( wrapper && wrapper.reset ) {
			wrapper.reset( value );
			value = wrapper.get();

			dontTeardownWrapper = true;
		}

		// Update evaluator value. This may be from the evaluator itself, or
		// it may be from the wrapper that wraps an evaluator's result - it
		// doesn't matter
		if ( evaluator ) {
			evaluator.value = value;
		}

		if ( !evaluator && ( !wrapper || !wrapper.reset ) ) {
			keys = keypath.split( '.' );
			lastKey = keys.pop();

			parentKeypath = keys.join( '.' );

			wrapper = ractive._wrapped[ parentKeypath ];

			if ( wrapper && wrapper.set ) {
				wrapper.set( lastKey, value );
			} else {
				parentValue = wrapper ? wrapper.get() : get( ractive, parentKeypath );

				if ( !parentValue ) {
					parentValue = createBranch( lastKey );
					set( ractive, parentKeypath, parentValue );
				}

				parentValue[ lastKey ] = value;
			}
		}

		clearCache( ractive, keypath, dontTeardownWrapper );

		if ( !silent ) {
			ractive._changes.push( keypath );
			notifyDependants( ractive, keypath );
		}
	}

	circular.set = set;
	return set;

});
