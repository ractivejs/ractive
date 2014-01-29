define( function () {

	'use strict';

	return function () {
		if ( !this._dirty ) {
			this._root._deferred.liveQueries.push( this );
			this._dirty = true;
		}
	};

});
