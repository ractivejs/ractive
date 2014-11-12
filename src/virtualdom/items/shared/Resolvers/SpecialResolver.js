var SpecialResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	this.rebind();
};

var props = {
	'@keypath': 'context',
	'@index': 'index',
	'@key': 'index'
};

SpecialResolver.prototype = {
	rebind: function () {
		var ref = this.ref, fragment = this.parentFragment, prop = props[ref];

		if ( !prop ) {
			throw new Error( 'Unknown special reference "' + ref + '" - valid references are @index, @key and @keypath' );
		}

		while ( fragment ) {
			if ( fragment[prop] !== undefined ) {
				return this.callback( '@' + fragment[prop] );
			}

			fragment = fragment.parent;
		}
	},

	unbind: function () {} // noop
};

export default SpecialResolver;
