import runloop from 'global/runloop';

export default function Component$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var childInstance = this.instance,
		indexRefAlias,
		query;

	this.resolvers.forEach( rebind );

	for ( let k in this.yielders ) {
		if ( this.yielders[k][0] ) {
			rebind( this.yielders[k][0] );
		}
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
}
