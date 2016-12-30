import Query from './shared/Query';

export default function Ractive$findAll ( selector, options ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.findAll('${selector}', ...) unless instance is rendered to the DOM` );

	options = options || {};
	let liveQueries = this._liveQueries;

	// Shortcut: if we're maintaining a live query with this
	// selector, we don't need to traverse the parallel DOM
	let query = liveQueries[ selector ];
	if ( query ) {
		// Either return the exact same query, or (if not live) a snapshot
		return ( options && options.live ) ? query : query.slice();
	}

	query = new Query( this, selector, !!options.live, false );

	// Add this to the list of live queries Ractive needs to maintain,
	// if applicable
	if ( query.live ) {
		liveQueries.push( selector );
		liveQueries[ '_' + selector ] = query;
	}

	this.fragment.findAll( selector, query );

	query.init();
	return query.result;
}
