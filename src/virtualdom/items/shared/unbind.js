export default function unbind () {
	if ( this.keypath ) {
		// this was registered as a dependant
		this.root.viewmodel.unregister( this.keypath, this );
	}

	if ( this.resolver ) {
		this.resolver.unbind();
	}
}
