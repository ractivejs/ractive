var IndexResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	this.rebind();
};

IndexResolver.prototype = {
	rebind: function () {
		var ref = this.ref,
			indexRefs = this.parentFragment.indexRefs,
			index = indexRefs[ ref ];

		if ( index !== undefined ) {
			this.callback( '@i' + index );
		}
	},

	unbind: function () {} // noop
};

export default IndexResolver;
