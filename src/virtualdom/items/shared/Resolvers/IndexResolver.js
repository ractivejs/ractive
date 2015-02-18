var IndexResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	// TEMP for getKeypath
	this.ractive = owner.root;

	ref.ref.fragment.registerIndexRef( this );

	this.rebind();
};

IndexResolver.prototype = {
	rebind: function () {
		var index, ref = this.ref.ref;

		if ( ref.ref.t === 'k' ) {
			index = 'k' + ref.fragment.key;
		} else {
			index = 'i' + ref.fragment.index;
		}

		if ( index !== undefined ) {
			this.callback( this.ractive.viewmodel.getKeypath( '@' + index ) );
		}
	},

	unbind: function () {
		this.ref.ref.fragment.unregisterIndexRef( this );
	}
};

export default IndexResolver;
