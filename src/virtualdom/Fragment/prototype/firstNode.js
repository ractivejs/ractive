export default function Fragment$firstNode () {
	if ( this.items && this.items[0] ) {
		return this.items[0].firstNode();
	} else if ( this.nodes ) {
		return this.nodes[0] || null;
	}

	return null;
}
