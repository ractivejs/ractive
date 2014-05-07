export default function ( selector, query ) {
	if ( this.fragment ) {
		this.fragment.findAllComponents( selector, query );
	}
}
