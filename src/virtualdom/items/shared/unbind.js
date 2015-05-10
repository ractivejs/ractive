export default function unbind () {
	if ( !this.isStatic ) {
		this.context.unregisterView( this );
	}
}
