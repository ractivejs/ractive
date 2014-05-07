export default function Fragment$render () {
	var docFrag;

	docFrag = this.docFrag = document.createDocumentFragment();

	this.items.forEach( function ( item ) {
		docFrag.appendChild( item.render() );
	});

	return docFrag;
}
