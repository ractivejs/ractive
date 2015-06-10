import { ELEMENT } from 'config/types';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';

function findParentElement ( item ) {
	let fragment = item.parentFragment;
	while ( fragment.owner.type !== ELEMENT ) {
		fragment = fragment.parent;
	}

	return fragment.owner.node;
}

export default class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	render () {
		const html = this.model ? this.model.value : '';

		const docFrag = document.createDocumentFragment();
		this.nodes = insertHtml( html, findParentElement( this ), docFrag );

		return docFrag;
	}

	toString () {
		return this.model ? this.model.value : '';
	}

	unrender () {
		this.nodes.forEach( node => node.parentNode.removeChild( node ) );
	}

	update () {
		this.unrender();
		const docFrag = this.render();

		findParentElement( this ).insertBefore( docFrag, this.parentFragment.findNextNode( this ) );
	}
}
