// TODO it's unfortunate that this has to run every time a
// component is rendered... is there a better way?
export default function updateLiveQueries ( component ) {
	// Does this need to be added to any live queries?
	let instance = component.ractive;

	do {
		const liveQueries = instance._liveComponentQueries;

		let i = liveQueries.length;
		while ( i-- ) {
			const name = liveQueries[i];
			const query = liveQueries[ `_${name}` ];

			if ( query.test( component ) ) {
				query.add( component.instance );
				// keep register of applicable selectors, for when we teardown
				component.liveQueries.push( query );
			}
		}
	} while ( instance = instance.parent );
}
