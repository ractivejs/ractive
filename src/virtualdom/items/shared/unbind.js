export default function unbind () {
	if ( !this.isStatic ) {
		this.keypath.unregister( this );
	}
}
