import { SECTION_EACH } from 'config/types';
import { getKeypath } from 'shared/keypaths'; // TODO maybe we don't need the @ construct now that we have Keypath objects?

var SpecialResolver = function ( owner, ref, callback ) {
	this.parentFragment = owner.parentFragment;
	this.ref = ref;
	this.callback = callback;

	this.rebind();
};

var props = {
	'@keypath': { prefix: 'c', prop: [ 'context' ] },
	'@index': { prefix: 'i', prop: [ 'index' ] },
	'@key': { prefix: 'k', prop: [ 'key', 'index' ] }
};

function getProp( target, prop ) {
	var value;
	for ( let i = 0; i < prop.prop.length; i++ ) {
		if ( ( value = target[prop.prop[i]] ) !== undefined ) {
			return value;
		}
	}
}

SpecialResolver.prototype = {
	rebind: function () {
		var ref = this.ref, fragment = this.parentFragment, prop = props[ref], value;

		if ( !prop ) {
			throw new Error( 'Unknown special reference "' + ref + '" - valid references are @index, @key and @keypath' );
		}

		// have we already found the nearest parent?
		if ( this.cached ) {
			return this.callback( getKeypath( '@' + prop.prefix + getProp( this.cached, prop ) ) );
		}

		// special case for indices, which may cross component boundaries
		if ( prop.prop.indexOf( 'index' ) !== -1 || prop.prop.indexOf( 'key' ) !== -1 ) {
			while ( fragment ) {
				if ( fragment.owner.currentSubtype === SECTION_EACH && ( value = getProp( fragment, prop ) ) !== undefined ) {
					this.cached = fragment;

					fragment.registerIndexRef( this );

					return this.callback( getKeypath( '@' + prop.prefix + value ) );
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
				if ( ( value = getProp( fragment, prop ) ) !== undefined ) {
					return this.callback( getKeypath( '@' + prop.prefix + value.str ) );
				}

				fragment = fragment.parent;
			}
		}
	},

	unbind: function () {
		if ( this.cached ) {
			this.cached.unregisterIndexRef( this );
		}
	}
};

export default SpecialResolver;
