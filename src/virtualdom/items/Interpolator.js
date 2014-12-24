import { INTERPOLATOR } from 'config/types';
import runloop from 'global/runloop';
import { escapeHtml } from 'utils/html';
import { detachNode } from 'utils/dom';
import { isEqual } from 'utils/is';
import unbind from './shared/unbind';
import Mustache from './shared/Mustache/_Mustache';
import detach from './shared/detach';

var Interpolator = function ( options ) {
	this.type = INTERPOLATOR;
	Mustache.init( this, options );
};

Interpolator.prototype = {
	update () {
		this.node.data = ( this.value == undefined ? '' : this.value );
	},
	resolve: Mustache.resolve,
	rebind: Mustache.rebind,
	detach: detach,

	unbind: unbind,

	render () {
		if ( !this.node ) {
			this.node = document.createTextNode( this.value != undefined ? this.value : '' );
		}

		return this.node;
	},

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) {
			detachNode( this.node );
		}
	},

	getValue: Mustache.getValue,

	// TEMP
	setValue ( value ) {
		var wrapper;

		// TODO is there a better way to approach this?
		if ( this.keypath && ( wrapper = this.root.viewmodel.wrapped[ this.keypath.str ] ) ) {
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

	firstNode () {
		return this.node;
	},

	toString ( escape ) {
		var string = ( this.value != undefined ? '' + this.value : '' );
		return escape ? escapeHtml( string ) : string;
	}
};

export default Interpolator;
