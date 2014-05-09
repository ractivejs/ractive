export default function Fragment$render () {
	var docFrag;

	docFrag = this.docFrag = document.createDocumentFragment();

	// TODO if there's only one item, don't bother with the docFrag

	this.items.forEach( function ( item ) {
		docFrag.appendChild( item.render() );
	});

	return docFrag;
}
