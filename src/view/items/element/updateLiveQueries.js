export default function updateLiveQueries ( element ) {
	// Does this need to be added to any live queries?
	const node = element.node;
	let instance = element.ractive;
	const queries = [], remotes = {};
	let remote = instance.component && instance.component.target === false;
	let i;

	do {
		const liveQueries = instance._liveQueries;

		i = liveQueries.length;
		while ( i-- ) {
			const query = liveQueries[i];

			if ( query.test( node ) ) {
				queries.push( query );
			}
		}

		if ( !remote && instance.component && instance.component.target === false ) remote = true;
		remotes[ instance._guid ] = remote;
	} while ( instance = instance.parent );

	i = queries.length;
	while ( i-- ) {
		const query = queries[i];
		if ( query.remote || !remotes[ query.ractive._guid ] ) {
			query.add( node );
			// keep register of applicable selectors, for when we teardown
			element.liveQueries.push( query );
		}
	}
}
