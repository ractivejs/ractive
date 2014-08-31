define(['global/runloop','virtualdom/items/shared/utils/getNewKeypath'],function (runloop, getNewKeypath) {

	'use strict';
	
	return function Component$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var childInstance = this.instance,
			parentInstance = childInstance._parent,
			indexRefAlias, query;
	
		this.bindings.forEach( function(binding ) {
			var updated;
	
			if ( binding.root !== parentInstance ) {
				return; // we only want parent -> child bindings for this
			}
	
			if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
				binding.rebind( updated );
			}
		});
	
		this.complexParameters.forEach( rebind );
	
		if ( this.yielder ) {
			rebind( this.yielder );
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
	};

});