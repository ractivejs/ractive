import types from 'config/types';
import runloop from 'global/runloop';
import escapeHtml from 'utils/escapeHtml';
import detachNode from 'utils/detachNode';
import isEqual from 'utils/isEqual';
import unbind from 'virtualdom/items/shared/unbind';
import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';
import detach from 'virtualdom/items/shared/detach';

var Interpolator = function ( options ) {
	this.type = types.INTERPOLATOR;
	Mustache.init( this, options );
};

Interpolator.prototype = {
	update: function () {
		this.node.data = ( this.value == undefined ? '' : this.value );
	},
	resolve: Mustache.resolve,
	rebind: Mustache.rebind,
	detach: detach,

	unbind: unbind,

	render: function () {
		if ( !this.node ) {
			this.node = document.createTextNode( this.value != undefined ? this.value : '' );
		}

		return this.node;
	},

	unrender: function ( shouldDestroy ) {
		if ( shouldDestroy ) {
			detachNode( this.node );
		}
	},

	getValue: Mustache.getValue,

	// TEMP
	setValue: function ( value ) {
		var wrapper;

		// TODO is there a better way to approach this?
		if ( wrapper = this.root.viewmodel.wrapped[ this.keypath ] ) {
			value = wrapper.get();
		}

		if ( !isEqual( value, this.value ) ) {
			this.value = value;
			this.parentFragment.bubble();

			if ( this.node ) {
				runloop.addView( this );
			}
		}
	},

	firstNode: function () {
		return this.node;
	},

	toString: function ( escape ) {
		var string = ( this.value != undefined ? '' + this.value : '' );
		return escape ? escapeHtml( string ) : string;
	}
};

export default Interpolator;
