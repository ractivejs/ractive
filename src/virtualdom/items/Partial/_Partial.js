import types from 'config/types';
import getPartialDescriptor from 'virtualdom/items/Partial/getPartialDescriptor';
import applyIndent from 'virtualdom/items/Partial/applyIndent';
import circular from 'circular';

var Partial, Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

Partial = function ( options ) {
	var parentFragment = this.parentFragment = options.parentFragment, template;

	this.type = types.PARTIAL;
	this.name = options.template.r;
	this.index = options.index;

	this.root = parentFragment.root;

	if ( !options.template.r ) {
		// TODO support dynamic partial switching
		throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
	}

	template = getPartialDescriptor( parentFragment.root, options.template.r );

	this.fragment = new Fragment({
		template: template,
		root:     parentFragment.root,
		owner:    this,
		pElement: parentFragment.pElement
	});
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
		return this.fragment.render();
	},

	unrender: function ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		return this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	unbind: function () {
		this.fragment.unbind();
	},

	toString: function ( toString ) {
		var string, previousItem, lastLine, match;

		string = this.fragment.toString( toString );

		previousItem = this.parentFragment.items[ this.index - 1 ];

		if ( !previousItem || ( previousItem.type !== types.TEXT ) ) {
			return string;
		}

		lastLine = previousItem.template.split( '\n' ).pop();

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
	}
};

export default Partial;
