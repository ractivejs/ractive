import { matches } from 'utils/dom';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';
import { decodeCharacterReferences } from 'utils/html';

export default class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	detach () {
		const docFrag = document.createDocumentFragment();
		this.nodes.forEach( node => docFrag.appendChild( node ) );
		return docFrag;
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

	findAll ( selector, query ) {
		const len = this.nodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const node = this.nodes[i];

			if ( node.nodeType !== 1 ) continue;

			if ( query.test( node ) ) query.add( node );

			const queryAllResult = node.querySelectorAll( selector );
			if ( queryAllResult ) {
				const numNodes = queryAllResult.length;
				let j;

				for ( j = 0; j < numNodes; j += 1 ) {
					query.add( queryAllResult[j] );
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

	rebind () {
		console.warn( 'TODO rebind triple' );
	}

	render ( target ) {
		const html = this.model ? this.model.value : '';
		this.nodes = insertHtml( html, this.parentFragment.findParentNode(), target );
	}

	toString () {
		return this.model && this.model.value != null ? decodeCharacterReferences( '' + this.model.value ) : '';
	}

	unrender () {
		this.nodes.forEach( node => node.parentNode.removeChild( node ) );
	}

	update () {
		if ( this.dirty ) {
			this.unrender();
			const docFrag = document.createDocumentFragment();
			this.render( docFrag );

			const parentNode = this.parentFragment.findParentNode();
			const anchor = this.parentFragment.findNextNode( this );

			parentNode.insertBefore( docFrag, anchor );

			this.dirty = false;
		}
	}
}
