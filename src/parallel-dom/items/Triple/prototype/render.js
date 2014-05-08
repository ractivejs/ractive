import insertHtml from 'parallel-dom/items/Triple/helpers/insertHtml';

export default function Triple$render () {
	var parentElement = this.pElement;

	this.docFrag = document.createDocumentFragment();
	this.nodes = insertHtml( this.value, this.parentFragment.getNode(), this.docFrag );

	return this.docFrag;
}
