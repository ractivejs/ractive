export default function EventHandler$teardown () {
	// Tear down dynamic name
	if ( typeof this.action !== 'string' ) {
		this.action.teardown();
	}

	// Tear down dynamic parameters
	if ( this.dynamicParams ) {
		this.dynamicParams.teardown();
	}
}
