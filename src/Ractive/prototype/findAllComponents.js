import Query from './shared/Query';

export default function Ractive$findAllComponents ( selector, options ) {
	options = options || {};
	let liveQueries = this._liveComponentQueries;

	// Shortcut: if we're maintaining a live query with this
	// selector, we don't need to traverse the parallel DOM
	let query = liveQueries[ selector ];
	if ( query ) {
		// Either return the exact same query, or (if not live) a snapshot
		return ( options && options.live ) ? query : query.slice();
	}

	query = new Query( this, selector, !!options.live, true );

	// Add this to the list of live queries Ractive needs to maintain,
	// if applicable
	if ( query.live ) {
		liveQueries.push( selector );
		liveQueries[ '_' + selector ] = query;
	}

	this.fragment.findAllComponents( selector, query );

	// search non-fragment children
	this._children.forEach( c => {
		if ( !c.target && c.ractive.fragment && c.ractive.fragment.rendered ) {
			if ( query.test( c ) ) query.add( c.ractive );

			c.ractive.fragment.findAllComponents( selector, query );
		}
	});

	query.init();
	return query.result;
}
