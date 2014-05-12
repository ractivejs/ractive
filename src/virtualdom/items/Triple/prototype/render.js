export default function Triple$render () {
	if ( this.rendered ) {
		throw new Error( 'Attempted to render an item that was already rendered' );
	}

	this.docFrag = document.createDocumentFragment();

	this.update();
	this.rendered = true;

	return this.docFrag;
}
