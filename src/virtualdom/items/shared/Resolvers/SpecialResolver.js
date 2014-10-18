var SpecialResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	this.rebind();
};

SpecialResolver.prototype = {
	rebind: function () {
		var ref = this.ref, fragment = this.parentFragment;

		if ( ref === '@keypath' ) {
			while ( fragment ) {
				if ( !!fragment.context ) {
					return this.callback( '@' + fragment.context );
				}

				fragment = fragment.parent;
			}
		}

		if ( ref === '@index' || ref === '@key' ) {
			while ( fragment ) {
				if ( fragment.index !== undefined ) {
					return this.callback( '@' + fragment.index );
				}

				fragment = fragment.parent;
			}
		}

		throw new Error( 'Unknown special reference "' + ref + '" - valid references are @index, @key and @keypath' );
	},

	unbind: function () {} // noop
};

export default SpecialResolver;