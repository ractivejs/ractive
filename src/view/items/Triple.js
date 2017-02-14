import { createDocumentFragment, matches } from '../../utils/dom';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';
import { decodeCharacterReferences } from '../../utils/html';
import { detachNode } from '../../utils/dom';
import { inAttribute } from './element/Attribute';

export default class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	detach () {
		const docFrag = createDocumentFragment();
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

	findComponent () {
		return null;
	}

	firstNode () {
		return this.nodes[0];
	}

	render ( target ) {
		const html = this.model ? this.model.get() : '';
		this.nodes = insertHtml( html, this.parentFragment.findParentNode(), target );
		this.rendered = true;
	}

	toString () {
		let value = this.model && this.model.get();
		value = value != null ? '' + value : '';

		return inAttribute() ? decodeCharacterReferences( value ) : value;
	}

	unrender () {
		if ( this.nodes ) this.nodes.forEach( node => detachNode( node ) );
		this.rendered = false;
	}

	update () {
		if ( this.rendered && this.dirty ) {
			this.dirty = false;

			this.unrender();
			const docFrag = createDocumentFragment();
			this.render( docFrag );

			const parentNode = this.parentFragment.findParentNode();
			const anchor = this.parentFragment.findNextNode( this );

			parentNode.insertBefore( docFrag, anchor );
		} else {
			// make sure to reset the dirty flag even if not rendered
			this.dirty = false;
		}
	}
}
