import runloop from 'global/runloop';

export default function () {
	if ( !this._dirty ) {
		this._dirty = true;

		// Once the DOM has been updated, ensure the query
		// is correctly ordered
		runloop.scheduleTask( () => {
			this._sort();
		});
	}
}
