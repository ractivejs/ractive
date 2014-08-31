define(['global/runloop'],function (runloop) {

	'use strict';
	
	return function () {var this$0 = this;
		if ( !this._dirty ) {
			this._dirty = true;
	
			// Once the DOM has been updated, ensure the query
			// is correctly ordered
			runloop.scheduleTask( function()  {
				this$0._sort();
			});
		}
	};

});