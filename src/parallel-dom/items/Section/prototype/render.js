export default function Section$render () {
	var docFrag;

	docFrag = this.docFrag = document.createDocumentFragment();

	this.fragments.forEach( function ( fragment ) {
		docFrag.appendChild( fragment.render() );
	});

	this.rendered = true;
	return docFrag;
}
