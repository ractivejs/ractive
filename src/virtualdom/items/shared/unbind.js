export default function unbind () {
	if ( this.handler ) {
		this.context.off( this.handler );
	}
}
