define([
	'circular',
	'utils/removeFromArray',
	'shared/registerDependant',
	'shared/unregisterDependant',
	'shared/notifyDependants'
], function (
	circular,
	removeFromArray,
	registerDependant,
	unregisterDependant,
	notifyDependants
) {

	'use strict';

	var get;

	circular.push( function () {
		get = circular.get;
	});

	var FailedLookup = function ( child, parent, keypath, parentFragment ) {
		this.root = parent;
		this.ref = keypath;
		this.parentFragment = parentFragment;

		this.child = child;

		registerDependant( this );
	};

	FailedLookup.prototype = {
		resolve: function () {
			var child, upstreamChanges, keys;

			child = this.child;

			child._failedLookups[ this.ref ] = false;
			removeFromArray( child._failedLookups, this );

			get( child, this.ref ); // trigger binding creation

			// notify dependants, and upstream dependants
			keys = this.ref.split( '.' );
			upstreamChanges = [];

			while ( keys.pop() ) {
				upstreamChanges.push( keys.join( '.' ) );
			}

			notifyDependants.multiple( child, upstreamChanges, true );
			notifyDependants( child, this.ref );
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};

	return FailedLookup;

});
