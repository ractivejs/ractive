import { matches } from 'utils/dom';
import findParentNode from './shared/findParentNode';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';

export default class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	find ( selector ) {
		const len = this.nodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const node = this.nodes[i];

			if ( node.nodeType !== 1 ) continue;

			if ( matches( node, selector ) ) return node;

			const queryResult = node.querySelector( selector );
			if ( queryResult ) return queryResult;
		}

		return null;
	}

	findAll ( selector, queryResult ) {
		const len = this.nodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const node = this.nodes[i];

			if ( node.nodeType !== 1 ) continue;

			if ( matches( node, selector ) ) queryResult.push( node );

			const queryAllResult = node.querySelectorAll( selector );
			if ( queryAllResult ) {
				const numNodes = queryAllResult.length;
				let j;

				for ( j = 0; j < numNodes; j += 1 ) {
					queryResult.push( queryAllResult[j] );
				}
			}
		}
	}

	findComponent ( name ) {
		return null;
	}

	firstNode () {
		return this.nodes[0];
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
		if ( this.dirty ) {
			this.unrender();
			const docFrag = this.render();

			const parentNode = findParentNode( this );
			const anchor = this.parentFragment.findNextNode( this );

			parentNode.insertBefore( docFrag, anchor );

			this.dirty = false;
		}
	}
}
