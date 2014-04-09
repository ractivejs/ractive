define([
	'global/runloop'
], function (
	runloop
) {

	'use strict';

	return function () {
		if ( !this._dirty ) {
			runloop.addLiveQuery( this );
			this._dirty = true;
		}
	};

});
