define([
	'config/types',
	'shared/teardown',
	'render/shared/initMustache',
	'render/shared/updateMustache',
	'render/shared/resolveMustache'
], function (
	types,
	teardown,
	initMustache,
	updateMustache,
	resolveMustache
) {
	
	'use strict';

	var StringInterpolator = function ( options ) {
		this.type = types.INTERPOLATOR;
		initMustache( this, options );
	};

	StringInterpolator.prototype = {
		update: updateMustache,
		resolve: resolveMustache,

		render: function ( value ) {
			this.value = value;
			this.parentFragment.bubble();
		},

		teardown: function () {
			teardown( this );
		},

		toString: function () {
			if ( this.value === undefined ) {
				return '';
			}

			if ( this.value === null ) {
				return 'null';
			}

			return this.value.toString();
		}
	};

	return StringInterpolator;

});