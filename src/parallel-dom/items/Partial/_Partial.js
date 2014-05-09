import types from 'config/types';
import getPartialDescriptor from 'parallel-dom/items/Partial/getPartialDescriptor';
import applyIndent from 'parallel-dom/items/Partial/applyIndent';
import circular from 'circular';

var Partial, Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

Partial = function ( options, docFrag ) {
	var parentFragment = this.parentFragment = options.parentFragment, template;

	this.type = types.PARTIAL;
	this.name = options.template.r;
	this.index = options.index;

	if ( !options.template.r ) {
		// TODO support dynamic partial switching
		throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
	}

	template = getPartialDescriptor( parentFragment.root, options.template.r );

	this.fragment = new Fragment({
		template:   template,
		root:         parentFragment.root,
		pNode:        parentFragment.pNode,
		owner:        this
	});
};

Partial.prototype = {
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

	reassign: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		return this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );
	},

	teardown: function ( destroy ) {
		this.fragment.teardown( destroy );
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
	}
};

export default Partial;
