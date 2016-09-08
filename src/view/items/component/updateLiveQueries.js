// TODO it's unfortunate that this has to run every time a
// component is rendered... is there a better way?
export default function updateLiveQueries ( component ) {
	// Does this need to be added to any live queries?
	let instance = component.ractive;
	const queries = [], remotes = {};
	let remote = component.target === false;
	let i;

	do {
		const liveQueries = instance._liveComponentQueries;

		i = liveQueries.length;
		while ( i-- ) {
			const query = liveQueries[i];

			if ( query.test( component ) ) {
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
			query.add( component.instance );
			// keep register of applicable selectors, for when we teardown
			component.liveQueries.push( query );
		}
	}
}
