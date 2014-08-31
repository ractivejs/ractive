define(['global/runloop'],function (runloop) {

	'use strict';
	
	return function unbind () {
		if ( !this.keypath ) {
			// this was on the 'unresolved' list, we need to remove it
			runloop.removeUnresolved( this );
		} else {
			// this was registered as a dependant
			this.root.viewmodel.unregister( this.keypath, this );
		}
	
		if ( this.resolver ) {
			this.resolver.unbind();
		}
	};

});