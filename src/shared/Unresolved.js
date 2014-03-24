define([
	'global/runloop'
], function (
	runloop
) {

	'use strict';

	var Unresolved = function ( ractive, ref, parentFragment, callback ) {
		this.root = ractive;
		this.ref = ref;
		this.parentFragment = parentFragment;

		this.resolve = callback;

		runloop.addUnresolved( this );
	};

	Unresolved.prototype = {
		teardown: function () {
			runloop.removeUnresolved( this );
		}
	};

	return Unresolved;

});
