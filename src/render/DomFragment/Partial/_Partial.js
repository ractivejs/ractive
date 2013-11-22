define([
	'config/types',
	'render/DomFragment/Partial/getPartialDescriptor',
	'circular'
], function (
	types,
	getPartialDescriptor,
	circular
) {

	'use strict';

	var DomPartial, DomFragment;

	circular.push( function () {
		DomFragment = circular.DomFragment;
	});

	DomPartial = function ( options, docFrag ) {
		var parentFragment = this.parentFragment = options.parentFragment, descriptor;

		this.type = types.PARTIAL;
		this.name = options.descriptor.r;
		this.index = options.index;

		if ( !options.descriptor.r ) {
			// TODO support dynamic partial switching
			throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
		}

		descriptor = getPartialDescriptor( parentFragment.root, options.descriptor.r );

		this.fragment = new DomFragment({
			descriptor:   descriptor,
			root:         parentFragment.root,
			pNode:        parentFragment.pNode,
			contextStack: parentFragment.contextStack,
			owner:        this
		});

		if ( docFrag ) {
			docFrag.appendChild( this.fragment.docFrag );
		}
	};

	DomPartial.prototype = {
		firstNode: function () {
			return this.fragment.firstNode();
		},

		findNextNode: function () {
			return this.parentFragment.findNextNode( this );
		},

		detach: function () {
			return this.fragment.detach();
		},

		teardown: function () {
			this.fragment.teardown();
		},

		toString: function () {
			return this.fragment.toString();
		}
	};

	return DomPartial;

});