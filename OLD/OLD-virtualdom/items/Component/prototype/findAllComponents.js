export default function Component$findAllComponents ( selector, query ) {
	query._test( this, true );

	if ( this.instance.fragment ) {
		this.instance.fragment.findAllComponents( selector, query );
	}
}
