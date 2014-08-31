define(['global/runloop','virtualdom/items/Element/special/select/sync'],function (runloop, syncSelect) {

	'use strict';
	
	return function bubbleSelect () {var this$0 = this;
		if ( !this.dirty ) {
			this.dirty = true;
	
			runloop.scheduleTask( function()  {
				syncSelect( this$0 );
				this$0.dirty = false;
			});
		}
	
		this.parentFragment.bubble(); // default behaviour
	};

});