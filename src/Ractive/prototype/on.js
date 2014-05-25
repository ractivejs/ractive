import trim from 'Ractive/prototype/shared/trim';
import notEmptyString from 'Ractive/prototype/shared/notEmptyString';

export default function ( eventName, callback ) {
	var self = this, listeners, n, eventNames;

	// allow mutliple listeners to be bound in one go
	if ( typeof eventName === 'object' ) {
		listeners = [];

		for ( n in eventName ) {
			if ( eventName.hasOwnProperty( n ) ) {
				listeners.push( this.on( n, eventName[ n ] ) );
			}
		}

		return {
			cancel: function () {
				var listener;

				while ( listener = listeners.pop() ) {
					listener.cancel();
				}
			}
		};
	}

	// Handle multiple space-separated event names
	eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

	eventNames.forEach( eventName => {
		( this._subs[ eventName ] || ( this._subs[ eventName ] = [] ) ).push( callback );
	});

	return {
		cancel: function () {
			self.off( eventName, callback );
		}
	};
}
