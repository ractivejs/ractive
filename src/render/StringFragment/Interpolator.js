define([
	'config/types',
	'shared/teardown',
	'render/shared/Mustache/_Mustache',
], function (
	types,
	teardown,
	Mustache
) {

	'use strict';

	var StringInterpolator = function ( options ) {
		this.type = types.INTERPOLATOR;
		Mustache.init( this, options );
	};

	StringInterpolator.prototype = {
		update: Mustache.update,
		resolve: Mustache.resolve,
		reassign: Mustache.reassign,

		render: function ( value ) {
			this.value = value;
			this.parentFragment.bubble();
		},

		teardown: function () {
			teardown( this );
		},

		toString: function () {
			if ( this.value == undefined ) {
				return '';
			}

			return stringify( this.value );
		}
	};

	return StringInterpolator;

	function stringify ( value ) {
		if ( typeof value === 'string' ) {
			return value;
		}

		return JSON.stringify( value );
	}

});
