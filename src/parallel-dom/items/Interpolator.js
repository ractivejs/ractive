import types from 'config/types';
import runloop from 'global/runloop';
import escapeHtml from 'utils/escapeHtml';
import detachNode from 'utils/detachNode';
import teardown from 'shared/teardown';
import Mustache from 'parallel-dom/shared/Mustache/_Mustache';
import detach from 'parallel-dom/items/shared/detach';

var Interpolator = function ( options ) {
	this.type = types.INTERPOLATOR;
	Mustache.init( this, options );
};

Interpolator.prototype = {
	update: function () {
		this.node.data = ( this.value == undefined ? '' : this.value );
	},
	resolve: Mustache.resolve,
	reassign: Mustache.reassign,
	detach: detach,

	teardown: function () {
		teardown( this );
	},

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

	// TEMP
	setValue: function ( value ) {
		var wrapper;

		// TODO is there a better way to approach this?
		if ( wrapper = this.root._wrapped[ this.keypath ] ) {
			value = wrapper.get();
		}

		if ( value !== this.value ) {
			this.value = value;
			this.parentFragment.bubble();

			if ( this.node ) {
				runloop.addUpdate( this );
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
