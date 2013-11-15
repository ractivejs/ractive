define([
	'config/types',
	'shared/teardown',
	'render/shared/initMustache',
	'render/shared/resolveMustache',
	'render/shared/updateMustache'
], function (
	types,
	teardown,
	initMustache,
	resolveMustache,
	updateMustache
) {

	'use strict';

	var DomInterpolator, lessThan, greaterThan;

	lessThan = /</g;
	greaterThan = />/g;

	DomInterpolator = function ( options, docFrag ) {
		this.type = types.INTERPOLATOR;

		if ( docFrag ) {
			this.node = document.createTextNode( '' );
			docFrag.appendChild( this.node );
		}

		// extend Mustache
		initMustache( this, options );
	};

	DomInterpolator.prototype = {
		update: updateMustache,
		resolve: resolveMustache,

		teardown: function ( detach ) {
			teardown( this );
			
			if ( detach ) {
				this.node.parentNode.removeChild( this.node );
			}
		},

		render: function ( value ) {
			if ( this.node ) {
				this.node.data = ( value === undefined ? '' : value );
			}
		},

		firstNode: function () {
			return this.node;
		},

		toString: function () {
			var value = ( this.value !== undefined ? '' + this.value : '' );
			return value.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
		}
	};

	return DomInterpolator;

});