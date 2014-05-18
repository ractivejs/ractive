import insertHtml from 'virtualdom/items/Triple/helpers/insertHtml';
import updateSelect from 'virtualdom/items/Triple/helpers/updateSelect';

export default function Triple$update () {
	var node, parentNode;

	if ( !this.rendered ) {
		return;
	}

	// Remove existing nodes
	while ( this.nodes && this.nodes.length ) {
		node = this.nodes.pop();
		node.parentNode.removeChild( node );
	}

	// Insert new nodes
	parentNode = this.parentFragment.getNode();

	this.nodes = insertHtml( this.value, parentNode, this.docFrag );
	parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );

	// Special case - we're inserting the contents of a <select>
	updateSelect( this.pElement );
}
