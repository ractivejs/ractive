define([
	'state/scheduler'
], function (
	scheduler
) {

	'use strict';

	return function () {
		if ( !this._dirty ) {
			scheduler.addLiveQuery( this );
			this._dirty = true;
		}
	};

});
