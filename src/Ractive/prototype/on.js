import trim from './shared/trim';
import notEmptyString from './shared/notEmptyString';

export default function Ractive$on ( eventName, callback ) {
	// eventName may already be a map
	const map = typeof eventName === 'object' ? eventName : {};
	// or it may be a string along with a callback
	if ( typeof eventName === 'string' ) map[ eventName ] = callback;

	let silent = false;
	const events = [];

	for ( const k in map ) {
		const callback = map[k];
		const caller = function ( ...args ) {
			if ( !silent ) return callback.apply( this, args );
		};
		const entry = {
			callback,
			handler: caller
		};

		if ( map.hasOwnProperty( k ) ) {
			const names = k.split( ' ' ).map( trim ).filter( notEmptyString );
			names.forEach( n => {
				( this._subs[ n ] || ( this._subs[ n ] = [] ) ).push( entry );
				if ( n.indexOf( '.' ) ) this._nsSubs++;
				events.push( [ n, entry ] );
			});
		}
	}

	return {
		cancel: () => events.forEach( e => this.off( e[0], e[1].callback ) ),
		isSilenced: () => silent,
		silence: () => silent = true,
		resume: () => silent = false
	};
}
