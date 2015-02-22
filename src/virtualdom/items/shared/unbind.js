export default function unbind () {
	if ( this.registered ) {
		// this was registered as a dependant
		this.keypath.unregister( this );
	}

	if ( this.resolver ) {
		this.resolver.unbind();
	}
}
