import types from 'config/types';
import getPartialDescriptor from 'virtualdom/items/Partial/getPartialDescriptor';
import applyIndent from 'virtualdom/items/Partial/applyIndent';
import circular from 'circular';

import runloop from 'global/runloop';

import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';
import config from 'config/config';
import parser from 'config/options/template/parser';

var Partial, Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

Partial = function ( options ) {
	var parentFragment = this.parentFragment = options.parentFragment;

	this.type = types.PARTIAL;
	this.name = options.template.r;
	this.index = options.index;

	this.root = parentFragment.root;

	Mustache.init( this, options );

	this.update();
};

Partial.prototype = {
	bubble: function () {
		this.parentFragment.bubble();
	},

	firstNode: function () {
		return this.fragment.firstNode();
	},

	findNextNode: function () {
		return this.parentFragment.findNextNode( this );
	},

	detach: function () {
		return this.fragment.detach();
	},

	render: function () {
		this.update();

		this.rendered = true;
		return this.fragment.render();
	},

	unrender: function ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		return this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	unbind: function () {
		if ( this.fragment ) {
			this.fragment.unbind();
		}
	},

	toString: function ( toString ) {
		var string, previousItem, lastLine, match;

		string = this.fragment.toString( toString );

		previousItem = this.parentFragment.items[ this.index - 1 ];

		if ( !previousItem || ( previousItem.type !== types.TEXT ) ) {
			return string;
		}

		lastLine = previousItem.text.split( '\n' ).pop();

		if ( match = /^\s+$/.exec( lastLine ) ) {
			return applyIndent( string, match[0] );
		}

		return string;
	},

	find: function ( selector ) {
		return this.fragment.find( selector );
	},

	findAll: function ( selector, query ) {
		return this.fragment.findAll( selector, query );
	},

	findComponent: function ( selector ) {
		return this.fragment.findComponent( selector );
	},

	findAllComponents: function ( selector, query ) {
		return this.fragment.findAllComponents( selector, query );
	},

	getValue: function () {
		return this.fragment.getValue();
	},

	resolve: Mustache.resolve,

	setValue: function( value ) {
		if ( this.value !== value ) {
			if ( this.fragment ) {
				this.fragment.unrender( true );
			}

			this.fragment = null;

			if ( this.rendered ) {
				runloop.addView( this );
			}
		}

		this.value = value;
	},

	update: function() {
		var template, docFrag, target, anchor;

		if ( !this.fragment ) {
			if ( this.name && ( config.registries.partials.findInstance( this.root, this.name ) || parser.fromId( this.name, { noThrow: true } ) ) ) {
				template = getPartialDescriptor( this.root, this.name );
			} else if ( this.value ){
				template = getPartialDescriptor( this.root, this.value );
			} else {
				template = [];
			}

			this.fragment = new Fragment({
				template: template,
				root: this.root,
				owner: this,
				pElement: this.parentFragment.pElement
			});

			if ( this.rendered ) {
				target = this.parentFragment.getNode();
				docFrag = this.render();
				anchor = this.parentFragment.findNextNode( this );
				target.insertBefore( docFrag, anchor );
			}
		}
	}
};

export default Partial;
