export default function ( selector, query ) {
	// Add this node to the query, if applicable, and register the
	// query on this element
	if ( query._test( this, true ) && query.live ) {
		( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
	}

	if ( this.fragment ) {
		this.fragment.findAll( selector, query );
	}
}
