export default function ( component ) {
	var ancestor, query;

	// If there's a live query for this component type, add it
	ancestor = component.root;
	while ( ancestor ) {
		if ( query = ancestor._liveComponentQueries[ '_' + component.name ] ) {
			query.push( component.instance );
		}

		ancestor = ancestor.parent;
	}
}
