define(['global/runloop','virtualdom/items/Element/special/select/sync'],function (runloop, syncSelect) {

	'use strict';
	
	return function bubbleSelect () {
		if ( !this.dirty ) {
			this.dirty = true;
	
			runloop.scheduleTask( () => {
				syncSelect( this );
				this.dirty = false;
			});
		}
	
		this.parentFragment.bubble(); // default behaviour
	};

});