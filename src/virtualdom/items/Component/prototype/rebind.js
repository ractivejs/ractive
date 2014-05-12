import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function Component$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var childInstance = this.instance,
		parentInstance = childInstance._parent,
		indexRefAlias, query;

	this.bindings.forEach( function ( binding ) {
		var updated;

		if ( binding.root !== parentInstance ) {
			return; // we only want parent -> child bindings for this
		}

		if ( binding.keypath === indexRef ) {
			childInstance.set( binding.otherKeypath, newIndex );
		}

		if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
			binding.rebind( updated );
		}
	});

	if ( indexRefAlias = this.indexRefBindings[ indexRef ] ) {
		childInstance.set( indexRefAlias, newIndex );
	}

	if ( query = this.root._liveComponentQueries[ '_' + this.name ] ) {
		query._makeDirty();
	}
}
