import { INTERPOLATOR } from 'config/types';
import runloop from 'global/runloop';
import { escapeHtml } from 'utils/html';
import { detachNode, safeToStringValue } from 'utils/dom';
import { isEqual } from 'utils/is';
import unbind from './shared/unbind';
import { initialiseMustache } from './shared/Mustache';
import detach from './shared/detach';

export default class Interpolator {
	constructor ( options ) {
		this.type = INTERPOLATOR;
		initialiseMustache( this, options );
	}

	update () {
		this.node.data = ( this.value == undefined ? '' : this.value );
	}

	render () {
		if ( !this.node ) {
			this.node = document.createTextNode( safeToStringValue(this.value) );
		}

		return this.node;
	}

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) {
			detachNode( this.node );
		}
	}

	setValue () {
		var wrapper;

		// TODO is there a better way to approach this?
		if ( this.context && ( wrapper = this.context.wrapper ) ) {
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
		var string = ( '' + safeToStringValue(this.value) );
		return escape ? escapeHtml( string ) : string;
	}
};

export default Interpolator;
