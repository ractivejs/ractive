import trim from './shared/trim';
import notEmptyString from './shared/notEmptyString';
import { removeFromArray } from '../../utils/array';

export default function Ractive$off ( eventName, callback ) {
	// if no event is specified, remove _all_ event listeners
	if ( !eventName ) {
		this._subs = {};
	} else {
		// Handle multiple space-separated event names
		const eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

		eventNames.forEach( event => {
			const subs = this._subs[ event ];
			// if given a specific callback to remove, remove only it
			if ( subs && callback ) {
				// flag this callback as off so that any in-flight firings don't call
				// a cancelled handler - this is _slightly_ hacky
				( callback._proxy || callback ).off = true;
				removeFromArray( subs, callback._proxy || callback );
			}

			// otherwise, remove all listeners for this event
			else if ( subs ) {
				subs.length = 0;
			}
		});
	}

	return this;
}
