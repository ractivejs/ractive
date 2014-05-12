import insertHtml from 'virtualdom/items/Triple/helpers/insertHtml';

export default function Triple$update () {
	var node, parentElement, parentNode;

	// remove existing nodes
	while ( this.nodes && this.nodes.length ) {
		node = this.nodes.pop();
		node.parentNode.removeChild( node );
	}

	// get new nodes
	this.nodes = insertHtml( this.value, this.parentFragment.getNode(), this.docFrag );

	parentNode = this.parentFragment.getNode();

	// If we're updating a previously-rendered triple, the nodes won't be
	// inserted automatically - we need to do it here
	if ( this.rendered ) {
		parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
	}

	// Special case - we're inserting the contents of a <select>
	parentElement = this.pElement;
	if ( parentElement && parentElement.name === 'select' && parentElement.binding ) {
		processSelectContents( parentElement );
	}

	this.parentFragment.bubble();
}

function processSelectContents ( parentElement ) {
	var option;

	// If one of them had a `selected` attribute, we need to sync
	// the model to the view
	if ( option = parentElement.find( 'option[selected]' ) ) {
		// TODO is there a better way than this? method not used anywhere else?
		parentElement.binding.setValue( option.value );
	}
}
