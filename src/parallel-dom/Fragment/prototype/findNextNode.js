export default function Fragment$findNextNode ( item ) {
	var index = item.index;

	if ( this.items[ index + 1 ] ) {
		return this.items[ index + 1 ].firstNode();
	}

	// if this is the root fragment, and there are no more items,
	// it means we're at the end...
	if ( this.owner === this.root ) {
		if ( !this.owner.component ) {
			return null;
		}

		// ...unless this is a component
		return this.owner.component.findNextNode();
	}

	if ( !this.owner.findNextNode ) {
		console.trace( this );
	}

	return this.owner.findNextNode( this );
}
