export default function Fragment$render () {
	var docFrag;

	if ( this.items.length === 1 ) {
		return this.items[0].render();
	}

	docFrag = document.createDocumentFragment();

	this.items.forEach( item => {
		docFrag.appendChild( item.render() );
	});

	return docFrag;
}
