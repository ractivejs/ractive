import runloop from 'global/runloop';
import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function Component$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var childInstance = this.instance,
		parentInstance = childInstance._parent,
		indexRefAlias, query;

	console.group( 'rebind component', arguments );

	// this.bindings.forEach( binding => {
	// 	var updated;

	// 	if ( binding.root !== parentInstance ) {
	// 		return; // we only want parent -> child bindings for this
	// 	}

	// 	if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
	// 		binding.rebind( updated );
	// 	}
	// });

	this.resolvers.forEach( rebind );

	this.complexParameters.forEach( rebind );

	if ( this.yielders[0] ) {
		rebind( this.yielders[0] );
	}

	if ( indexRefAlias = this.indexRefBindings[ indexRef ] ) {
		runloop.addViewmodel( childInstance.viewmodel );
		childInstance.viewmodel.set( indexRefAlias, newIndex );
	}

	if ( query = this.root._liveComponentQueries[ '_' + this.name ] ) {
		query._makeDirty();
	}

	function rebind ( x ) {
		x.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}

	console.groupEnd();
}
