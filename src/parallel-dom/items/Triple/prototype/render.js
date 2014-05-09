import insertHtml from 'parallel-dom/items/Triple/helpers/insertHtml';

export default function Triple$render () {
	this.docFrag = document.createDocumentFragment();
	this.rendered = true;

	this.update();
	return this.docFrag;
}
