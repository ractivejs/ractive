import insertHtml from 'parallel-dom/items/Triple/helpers/insertHtml';

export default function Triple$update () {
	var node, parentElement, parentNode;

	if ( !this.rendered ) return;

	// remove existing nodes
	while ( this.nodes && this.nodes.length ) {
		node = this.nodes.pop();
		node.parentNode.removeChild( node );
	}

	// get new nodes
	this.nodes = insertHtml( this.value, this.parentFragment.getNode(), this.docFrag );

	parentNode = this.parentFragment.getNode();
	parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );

	// Special case - we're inserting the contents of a <select>
	parentElement = this.pElement;
	if ( parentElement && parentElement.name === 'select' && parentElement.binding ) {
		processSelectContents( parentElement );
	}
}

function processSelectContents ( parentElement ) {
	var option;

	// If one of them had a `selected` attribute, we need to sync
	// the model to the view
	if ( option = parentElement.find( 'option[selected]' ) ) {
		parentElement.binding.setValue( option.value );
	}

	// Otherwise, we may need to sync the view to the model
	else {
		parentElement.attributes.value.update();
	}
}
