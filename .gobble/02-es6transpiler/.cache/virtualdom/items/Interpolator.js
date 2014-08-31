define(['config/types','global/runloop','utils/escapeHtml','utils/detachNode','utils/isEqual','virtualdom/items/shared/unbind','virtualdom/items/shared/Mustache/_Mustache','virtualdom/items/shared/detach'],function (types, runloop, escapeHtml, detachNode, isEqual, unbind, Mustache, detach) {

	'use strict';
	
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
	
	return Interpolator;

});