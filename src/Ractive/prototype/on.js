import trim from './shared/trim';
import notEmptyString from './shared/notEmptyString';

export default function Ractive$on ( eventName, callback ) {
	// allow multiple listeners to be bound in one go
	if ( typeof eventName === 'object' ) {
		let listeners = [];
		let n;

		for ( n in eventName ) {
			if ( eventName.hasOwnProperty( n ) ) {
				listeners.push( this.on( n, eventName[ n ] ) );
			}
		}

		return {
			cancel () { listeners.forEach( l => l.cancel() ); }
		};
	}

	// Handle multiple space-separated event names
	const eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );

	eventNames.forEach( eventName => {
		( this._subs[ eventName ] || ( this._subs[ eventName ] = [] ) ).push( { callback } );
	});

	return {
		cancel: () => eventNames.forEach( n => this.off( n, callback ) )
	};
}
