import types from 'config/types';
import runloop from 'global/runloop';
import teardown from 'shared/teardown';
import Mustache from 'parallel-dom/shared/Mustache/_Mustache';
import detach from 'parallel-dom/items/shared/detach';

var Interpolator, lessThan, greaterThan;
lessThan = /</g;
greaterThan = />/g;

Interpolator = function ( options, docFrag ) {
	this.type = types.INTERPOLATOR;

	if ( docFrag ) {
		this.node = document.createTextNode( '' );
		docFrag.appendChild( this.node );
	}

	// extend Mustache
	Mustache.init( this, options );
};

Interpolator.prototype = {
	update: function () {
		this.node.data = ( this.value == undefined ? '' : this.value );
	},
	resolve: Mustache.resolve,
	reassign: Mustache.reassign,
	detach: detach,

	teardown: function ( destroy ) {
		if ( destroy ) {
			this.detach();
		}

		teardown( this );
	},

	render: function () {
		this.node = document.createTextNode( this.value != undefined ? this.value : '' );
		this.rendered = true;

		return this.node;
	},

	unrender: function () {
		throw new Error( 'TODO not implemented' );
	},

	// TEMP
	setValue: function ( value ) {
		if ( value !== this.value ) {
			this.value = value;
			this.parentFragment.bubble();

			if ( this.rendered ) {
				runloop.addUpdate( this );
			}
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

export default Interpolator;
