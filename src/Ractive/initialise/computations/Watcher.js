define([
	'utils/isEqual',
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	isEqual,
	registerDependant,
	unregisterDependant
) {

	'use strict';

	var Watcher = function ( computation, keypath ) {
		this.root = computation.ractive;
		this.keypath = keypath;
		this.priority = 0;

		this.computation = computation;

		registerDependant( this );
	};

	Watcher.prototype = {
		update: function () {
			var value;

			value = this.root.get( this.keypath );

			if ( !isEqual( value, this.value ) ) {
				this.computation.bubble();
			}
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};

	return Watcher;

});
