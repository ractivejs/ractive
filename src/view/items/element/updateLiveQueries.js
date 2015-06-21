export default function updateLiveQueries ( element ) {
	// Does this need to be added to any live queries?
	let instance = element.ractive;

	do {
		const liveQueries = instance._liveQueries;

		let i = liveQueries.length;
		while ( i-- ) {
			const selector = liveQueries[i];
			const query = liveQueries[ `_${selector}` ];

			if ( query._test( element ) ) {
				// keep register of applicable selectors, for when we teardown
				element.liveQueries.push( query );
			}
		}
	} while ( instance = instance.parent );
}
