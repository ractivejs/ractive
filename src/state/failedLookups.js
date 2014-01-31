define( function () {

	'use strict';

	var failed, dirty, failedLookups;

	failed = {};
	dirty = false;

	failedLookups = function ( keypath ) {
		return failed[ keypath ];
	};

	failedLookups.add = function ( keypath ) {
		failed[ keypath ] = true;
		dirty = true;
	};

	failedLookups.purge = function () {
		if ( dirty ) {
			failed = {};
			dirty = false;
		}
	};

	return failedLookups;

});