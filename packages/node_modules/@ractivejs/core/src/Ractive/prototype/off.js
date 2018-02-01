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
				const entry = subs.find( s => s.callback === callback );
				if ( entry ) {
					removeFromArray( subs, entry );
					entry.off = true;

					if ( event.indexOf( '.' ) ) this._nsSubs--;
				}
			}

			// otherwise, remove all listeners for this event
			else if ( subs ) {
				if ( event.indexOf( '.' ) ) this._nsSubs -= subs.length;
				subs.length = 0;
			}
		});
	}

	return this;
}
