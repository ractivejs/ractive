define([
	'global/runloop',
	'shared/resolveRef',
	'shared/teardown'
], function (
	runloop,
	resolveRef,
	teardown
) {

	'use strict';

	var ReferenceScout = function ( resolver, ref, parentFragment, argNum ) {
		var keypath, ractive;

		ractive = this.root = resolver.root;
		this.ref = ref;
		this.parentFragment = parentFragment;

		keypath = resolveRef( ractive, ref, parentFragment );
		if ( keypath !== undefined ) {
			resolver.resolve( argNum, false, keypath );
		} else {
			this.argNum = argNum;
			this.resolver = resolver;

			runloop.addUnresolved( this );
		}
	};

	ReferenceScout.prototype = {
		resolve: function ( keypath ) {
			this.keypath = keypath;
			this.resolver.resolve( this.argNum, false, keypath );
		},

		teardown: function () {
			// if we haven't found a keypath yet, we can
			// stop the search now
			if ( !this.keypath ) {
				teardown( this );
			}
		}
	};

	return ReferenceScout;

});
