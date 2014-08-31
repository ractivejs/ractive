define(['Ractive/prototype/shared/fireEvent','utils/removeFromArray','utils/Promise'],function (fireEvent, removeFromArray, Promise) {

	'use strict';
	
	return function Ractive$teardown ( callback ) {
		var promise;
	
		fireEvent( this, 'teardown' );
		this.fragment.unbind();
		this.viewmodel.teardown();
	
		if ( this.rendered && this.el.__ractive_instances__ ) {
			removeFromArray( this.el.__ractive_instances__, this );
		}
	
		promise = ( this.rendered ? this.unrender() : Promise.resolve() );
	
		if ( callback ) {
			// TODO deprecate this?
			promise.then( callback.bind( this ) );
		}
	
		return promise;
	};

});