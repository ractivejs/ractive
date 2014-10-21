import runloop from 'global/runloop';
import startsWith from 'virtualdom/items/shared/utils/startsWith';
import assignNewKeypath from 'virtualdom/items/shared/utils/assignNewKeypath';

export default function Component$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var childInstance = this.instance,
		parentInstance = childInstance._parent,
		key,
		mapping,
		indexRefAlias, query;

	// TODO shouldn't this be handled by resolvers?
	for ( key in this.instance.viewmodel.mappings ) {
		this.instance.viewmodel.mappings[ key ].rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}

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
}
