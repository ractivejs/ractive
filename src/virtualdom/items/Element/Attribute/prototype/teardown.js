export default function Attribute$teardown () {
	var i;

	if ( this.boundEvents ) {
		i = this.boundEvents.length;

		while ( i-- ) {
			this.node.removeEventListener( this.boundEvents[i], this.updateModel, false );
		}
	}

	// ignore non-dynamic attributes
	if ( this.fragment ) {
		this.fragment.unbind();
	}
}
