export default function EventHandler$unbind () {
	if ( this.method ) {
		this.unresolved.forEach( teardown );
		return;
	}

	// Tear down dynamic name
	if ( typeof this.action !== 'string' ) {
		this.action.teardown();
	}

	// Tear down dynamic parameters
	if ( this.dynamicParams ) {
		this.dynamicParams.teardown();
	}
}

function teardown ( x ) {
	x.teardown();
}
