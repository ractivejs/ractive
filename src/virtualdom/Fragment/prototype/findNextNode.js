export default function Fragment$findNextNode ( item ) {
	var index = item.index, node;

	if ( this.items[ index + 1 ] ) {
		node = this.items[ index + 1 ].firstNode();
	}

	// if this is the root fragment, and there are no more items,
	// it means we're at the end...
	else if ( this.owner === this.root ) {
		if ( !this.owner.component ) {
			// TODO but something else could have been appended to
			// this.root.el, no?
			node = null;
		}

		// ...unless this is a component
		else {
			node = this.owner.component.findNextNode();
		}
	}

	else {
		node = this.owner.findNextNode( this );
	}

	return node;
}
