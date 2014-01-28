define([
	'shared/resolveRef',
	'shared/teardown'
], function (
	resolveRef,
	teardown
) {

	'use strict';

	var ReferenceScout = function ( resolver, ref, contextStack, argNum ) {
		var keypath, root;

		root = this.root = resolver.root;

		keypath = resolveRef( root, ref, contextStack );
		if ( keypath !== undefined ) {
			resolver.resolveRef( argNum, false, keypath );
		} else {
			this.ref = ref;
			this.argNum = argNum;
			this.resolver = resolver;
			this.contextStack = contextStack;

			root._pendingResolution.push( this );
		}
	};

	ReferenceScout.prototype = {
		resolve: function ( keypath ) {
			this.keypath = keypath;
			this.resolver.resolveRef( this.argNum, false, keypath );
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