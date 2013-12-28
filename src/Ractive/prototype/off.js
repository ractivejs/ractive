define([
	'utils/defineProperty',
	'utils/create'
], function (
	defineProperty,
	create
) {

	'use strict';

	return function ( eventName, callback ) {
		var subscribers, index;

		// if no callback specified, remove all callbacks
		if ( !callback ) {
			// if no event name specified, remove all callbacks for all events
			if ( !eventName ) {
				defineProperty( this, '_subs', { value: create( null ), configurable: true });
			} else {
				this._subs[ eventName ] = [];
			}
		}

		subscribers = this._subs[ eventName ];

		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

});