import types from 'config/types';

var SpecialResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	this.rebind();
};

var props = {
	'@keypath': { prefix: 'c', prop: 'context' },
	'@index': { prefix: 'i', prop: 'index' },
	'@key': { prefix: 'k', prop: 'key' }
};

SpecialResolver.prototype = {
	rebind: function () {
		var ref = this.ref, fragment = this.parentFragment, prop = props[ref];

		if ( !prop ) {
			throw new Error( 'Unknown special reference "' + ref + '" - valid references are @index, @key and @keypath' );
		}

		// have we already found the nearest parent?
		if ( this.cached ) {
			return this.callback( '@' + prop.prefix + this.cached.fragment[prop.prop] );
		}

		// special case for indices, which may cross component boundaries
		if ( prop.prop === 'index' || prop.prop === 'key' ) {
			while ( fragment ) {
				if ( fragment.owner.currentSubtype === types.SECTION_EACH && fragment[prop.prop] !== undefined ) {
					this.cached = {
						fragment: fragment
					};

					fragment.registerIndexRef( this );

					return this.callback( '@' + prop.prefix + fragment[prop.prop] );
				}

				// watch for component boundaries
				if ( !fragment.parent && fragment.owner &&
				     fragment.owner.component && fragment.owner.component.parentFragment &&
				     !fragment.owner.component.instance.isolated ) {
					fragment = fragment.owner.component.parentFragment;
				} else {
					fragment = fragment.parent;
				}
			}
		}

		else {
			while ( fragment ) {
				if ( fragment[prop.prop] !== undefined ) {
					return this.callback( '@' + prop.prefix + fragment[prop.prop] );
				}

				fragment = fragment.parent;
			}
		}
	},

	unbind: function () {
		if ( this.cached ) {
			this.cached.fragment.unregisterIndexRef( this );
		}
	}
};

export default SpecialResolver;
