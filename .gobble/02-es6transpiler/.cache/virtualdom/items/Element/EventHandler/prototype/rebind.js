define(['virtualdom/items/shared/utils/getNewKeypath'],function (getNewKeypath) {

	'use strict';
	
	return function EventHandler$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
		if ( this.method ) {
			this.args.forEach( function ( arg ) {
				if ( arg.indexRef && arg.indexRef === indexRef ) {
					arg.value = newIndex;
				}
	
				if ( arg.keypath && ( newKeypath = getNewKeypath( arg.keypath, oldKeypath, newKeypath ) ) ) {
					arg.keypath = newKeypath;
				}
			});
	
			return;
		}
	
		if ( typeof this.action !== 'string' ) {
			this.action.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	
		if ( this.dynamicParams ) {
			this.dynamicParams.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	};

});