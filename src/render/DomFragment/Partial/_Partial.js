define([
	'require',
	'config/types',
	'render/DomFragment/Partial/getPartialDescriptor'
], function (
	require,
	types,
	getPartialDescriptor
) {

	'use strict';

	var DomPartial, DomFragment;

	loadCircularDependency( function () {
		require([ 'render/DomFragment/_DomFragment' ], function ( dep ) {
			DomFragment = dep;
		});
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
			parentNode:   parentFragment.parentNode,
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

		teardown: function ( detach ) {
			this.fragment.teardown( detach );
		},

		toString: function () {
			return this.fragment.toString();
		}
	};

	return DomPartial;

});