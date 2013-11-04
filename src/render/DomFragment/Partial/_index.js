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
		// circular...
		require([ 'render/DomFragment/_index' ], function ( dep ) {
			DomFragment = dep;
		});
	});

	DomPartial = function ( options, docFrag ) {
		var parentFragment = this.parentFragment = options.parentFragment, descriptor;

		this.type = types.PARTIAL;
		this.name = options.descriptor.r;

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