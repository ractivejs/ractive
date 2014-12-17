import { getKeypath } from 'shared/keypaths'; // TODO find a better way than @

var IndexResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

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
			this.callback( getKeypath( '@' + index ) );
		}
	},

	unbind: function () {
		this.ref.ref.fragment.unregisterIndexRef( this );
	}
};

export default IndexResolver;
