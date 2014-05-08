import insertHtml from 'parallel-dom/items/Triple/helpers/insertHtml';

export default function Triple$update () {
	// remove existing nodes
	while ( this.nodes.length ) {
		node = this.nodes.pop();
		node.parentNode.removeChild( node );
	}

	// get new nodes
	parentElement = this.pElement;

	this.nodes = insertHtml( this.value, this.parentFragment.getNode(), this.docFrag );

	parentNode = this.pElement.node;
	parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );

	// Special case - we're inserting the contents of a <select>
	if ( parentNode.tagName === 'SELECT' && parentNode._ractive && parentNode._ractive.binding ) {
		parentNode._ractive.binding.update();
	}
}
