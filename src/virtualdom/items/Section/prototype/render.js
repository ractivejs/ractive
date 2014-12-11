export default function Section$render () {
	this.docFrag = document.createDocumentFragment();

	this.fragments.forEach( f => this.docFrag.appendChild( f.render() ) );

	this.renderedFragments = this.fragments.slice();
	this.fragmentsToRender = [];

	this.rendered = true;
	return this.docFrag;
}
