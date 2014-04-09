define([
	'circular',
	'utils/removeFromArray',
	'global/runloop',
	'shared/notifyDependants'
], function (
	circular,
	removeFromArray,
	runloop,
	notifyDependants
) {

	'use strict';

	var get, empty = {};

	circular.push( function () {
		get = circular.get;
	});

	var UnresolvedImplicitDependency = function ( ractive, keypath ) {
		this.root = ractive;
		this.ref = keypath;
		this.parentFragment = empty;

		ractive._unresolvedImplicitDependencies[ keypath ] = true;
		ractive._unresolvedImplicitDependencies.push( this );

		runloop.addUnresolved( this );
	};

	UnresolvedImplicitDependency.prototype = {
		resolve: function () {
			var ractive = this.root;

			notifyDependants( ractive, this.ref );

			ractive._unresolvedImplicitDependencies[ this.ref ] = false;
			removeFromArray( ractive._unresolvedImplicitDependencies, this );
		},

		teardown: function () {
			runloop.removeUnresolved( this );
		}
	};

	return UnresolvedImplicitDependency;

});
