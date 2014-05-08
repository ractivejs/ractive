import insertHtml from 'parallel-dom/items/Triple/helpers/insertHtml';

export default function Triple$render () {
	this.docFrag = document.createDocumentFragment();
	this.nodes = insertHtml( this.value, this.parentFragment.getNode(), this.docFrag );

	return this.docFrag;
}
