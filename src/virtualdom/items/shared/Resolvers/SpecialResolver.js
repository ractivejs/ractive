var SpecialResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	this.rebind();
};

var props = {
	'@keypath': { prefix: 'p', name: 'context' },
	'@index': { prefix: 'i', name: 'index' },
	'@key': { prefix: 'k', name: 'index' }
};

SpecialResolver.prototype = {
	rebind: function () {
		var ref = this.ref, fragment = this.parentFragment, prop = props[ref];

		if ( !prop ) {
			throw new Error( 'Unknown special reference "' + ref + '" - valid references are @index, @key and @keypath' );
		}

		while ( fragment ) {
			if ( fragment[prop.name] !== undefined ) {
				return this.callback( '@' + prop.prefix + fragment[prop.name] );
			}

			fragment = fragment.parent;
		}
	},

	unbind: function () {} // noop
};

export default SpecialResolver;
