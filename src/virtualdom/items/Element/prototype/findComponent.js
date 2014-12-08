export default function ( selector, options ) {
	if ( this.fragment ) {
		return this.fragment.findComponent( selector, options );
	}
}
