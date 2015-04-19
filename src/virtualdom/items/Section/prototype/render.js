export default function Section$render () {
	var docFrag = this.docFrag = document.createDocumentFragment(),
		fragments = this.fragments;

	for ( var i = 0, len = fragments.length; i < len; i++ ) {
		docFrag.appendChild( fragments[i].render() );
	}

	this.fragmentsToRender = [];
	this.rendered = true;

	return this.docFrag;
}
