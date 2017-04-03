import trim from './shared/trim';
import notEmptyString from './shared/notEmptyString';

export default function Ractive$off ( eventName, callback ) {
	// if no arguments specified, remove all callbacks
	if ( !eventName ) {
		// TODO use this code instead, once the following issue has been resolved
		// in PhantomJS (tests are unpassable otherwise!)
		// https://github.com/ariya/phantomjs/issues/11856
		// defineProperty( this, '_subs', { value: create( null ), configurable: true });
		for ( eventName in this._subs ) {
			delete this._subs[ eventName ];
		}
	}

	else {
		// Handle multiple space-separated event names
		const eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

		eventNames.forEach( eventName => {
			let subscribers = this._subs[ eventName ];

			// If we have subscribers for this event...
			if ( subscribers ) {
				// ...if a callback was specified, only remove that
				if ( callback ) {
					// flag this callback as off so that any in-flight firings don't call
					// a cancelled handler - this is _slightly_ hacky
					let i = subscribers.length;
					while ( i-- ) {
						if ( subscribers[i].callback === callback ) {
							subscribers[i].off = true;
							subscribers.splice( i, 1 );
						}
					}
				}

				// ...otherwise remove all callbacks
				else {
					this._subs[ eventName ] = [];
				}
			}
		});
	}

	return this;
}
