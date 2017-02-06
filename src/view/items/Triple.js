import { createDocumentFragment, matches } from '../../utils/dom';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';
import { decodeCharacterReferences } from '../../utils/html';
import { detachNode } from '../../utils/dom';

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
		return this.rendered && this.nodes[0];
	}

	render ( target, occupants ) {
		const parentNode = this.parentFragment.findParentNode();

		if ( !this.nodes ) {
			const html = this.model ? this.model.get() : '';
			this.nodes = insertHtml( html, parentNode );
		}

		let nodes = this.nodes;
		let anchor = this.parentFragment.findNextNode( this );

		// progressive enhancement
		if ( occupants ) {
			let i = -1;
			let next;
			while ( occupants.length && ( next = this.nodes[ i + 1 ] ) ) {
				let n;
				while ( n = occupants.shift () ) {
					if ( n.nodeType === next.nodeType ) {
						if (
							( n.nodeType === 1 && n.outerHTML === next.outerHTML ) ||
							( n.nodeType === 3 && n.textContent === next.textContent ) ||
							( n.nodeType === 8 && n.textContent === next.textContent )
						) {
							this.nodes.splice( ++i, 1, n );
							break;
						} else {
							target.removeChild( n );
						}
					} else {
						target.removeChild( n );
					}
				}
			}

			if ( i >= 0 ) {
				nodes = this.nodes.slice( i );
			}

			if ( occupants.length ) anchor = occupants[0];
		}

		const frag = createDocumentFragment();
		nodes.forEach( n => frag.appendChild( n ) );

		if ( anchor ) {
			anchor.parentNode.insertBefore( frag, anchor );
		} else {
			this.parentFragment.findParentNode().appendChild( frag );
		}

		this.rendered = true;
	}

	toString () {
		return this.model && this.model.get() != null ? decodeCharacterReferences( '' + this.model.get() ) : '';
	}

	unrender ( shouldDestroy ) {
		if ( this.nodes ) this.nodes.forEach( node => detachNode( node ) );
		if ( shouldDestroy ) this.nodes = null;
		this.rendered = false;
	}

	update () {
		if ( this.rendered && this.dirty ) {
			this.dirty = false;

			this.unrender( true );
			this.render();
		} else {
			// make sure to reset the dirty flag even if not rendered
			this.dirty = false;
			if ( this.nodes ) this.nodes = null;
		}
	}
}
