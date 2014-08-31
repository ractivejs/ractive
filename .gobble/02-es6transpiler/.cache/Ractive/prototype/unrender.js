define(['utils/removeFromArray','global/runloop','global/css'],function (removeFromArray, runloop, css) {

	'use strict';
	
	return function Ractive$unrender () {var this$0 = this;
		var promise, shouldDestroy;
	
		if ( !this.rendered ) {
			throw new Error( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
		}
	
		promise = runloop.start( this, true );
	
		// If this is a component, and the component isn't marked for destruction,
		// don't detach nodes from the DOM unnecessarily
		shouldDestroy = !this.component || this.component.shouldDestroy;
		shouldDestroy = shouldDestroy || this.shouldDestroy;
	
		if ( this.constructor.css ) {
			promise.then( function()  {
				css.remove( this$0.constructor );
			});
		}
	
		// Cancel any animations in progress
		while ( this._animations[0] ) {
			this._animations[0].stop(); // it will remove itself from the index
		}
	
		this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	
		removeFromArray( this.el.__ractive_instances__, this );
	
		runloop.end();
		return promise;
	};

});