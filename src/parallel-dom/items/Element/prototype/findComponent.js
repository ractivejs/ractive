export default function ( selector ) {
	if ( this.fragment ) {
		return this.fragment.findComponent( selector );
	}
}
