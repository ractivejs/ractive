define([
	'config/types',
	'shared/teardown',
	'render/shared/Mustache/_Mustache',
	'render/DomFragment/shared/detach'
], function (
	types,
	teardown,
	Mustache,
	detach
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
		Mustache.init( this, options );
	};

	DomInterpolator.prototype = {
		update: Mustache.update,
		resolve: Mustache.resolve,
		reassign: Mustache.reassign,
		detach: detach,

		teardown: function ( destroy ) {
			if ( destroy ) {
				this.detach();
			}

			teardown( this );
		},

		render: function ( value ) {
			if ( this.node ) {
				this.node.data = ( value == undefined ? '' : value );
			}
		},

		firstNode: function () {
			return this.node;
		},

		toString: function () {
			var value = ( this.value != undefined ? '' + this.value : '' );
			return value.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
		}
	};

	return DomInterpolator;

});
