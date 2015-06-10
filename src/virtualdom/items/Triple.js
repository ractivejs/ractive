import { ELEMENT } from 'config/types';
import findParentNode from './shared/findParentNode';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';

export default class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	render () {
		const html = this.model ? this.model.value : '';

		const docFrag = document.createDocumentFragment();
		this.nodes = insertHtml( html, findParentNode( this ), docFrag );

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

		findParentNode( this ).insertBefore( docFrag, this.parentFragment.findNextNode( this ) );
	}
}
