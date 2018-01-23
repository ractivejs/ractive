import { createDocumentFragment, matches } from '../../utils/dom';
import Mustache from './shared/Mustache';
import insertHtml from './triple/insertHtml';
import { decodeCharacterReferences } from '../../utils/html';
import { detachNode } from '../../utils/dom';
import { inAttribute } from './element/Attribute';
import runloop from '../../global/runloop';

export default class Triple extends Mustache {
	constructor ( options ) {
		super( options );
	}

	detach () {
		const docFrag = createDocumentFragment();
		if ( this.nodes ) this.nodes.forEach( node => docFrag.appendChild( node ) );
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

	findAll ( selector, options ) {
		const { result } = options;
		const len = this.nodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const node = this.nodes[i];

			if ( node.nodeType !== 1 ) continue;

			if ( matches( node, selector ) ) result.push( node );

			const queryAllResult = node.querySelectorAll( selector );
			if ( queryAllResult ) {
				result.push.apply( result, queryAllResult );
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
			this.nodes = insertHtml( html, this.parentFragment.findParentNode(), target );
		}

		let nodes = this.nodes;
		let anchor = this.parentFragment.findNextNode( this );

		// progressive enhancement
		if ( occupants ) {
			let i = -1;
			let next;

			// start with the first node that should be rendered
			while ( occupants.length && ( next = this.nodes[ i + 1 ] ) ) {
				let n;
				// look through the occupants until a matching node is found
				while ( n = occupants.shift() ) {
					const t = n.nodeType;

					if ( t === next.nodeType && ( ( t === 1 && n.outerHTML === next.outerHTML ) || ( ( t === 3 || t === 8 ) && n.nodeValue === next.nodeValue ) ) ) {
						this.nodes.splice( ++i, 1, n ); // replace the generated node with the existing one
						break;
					} else {
						target.removeChild( n ); // remove the non-matching existing node
					}
				}
			}

			if ( i >= 0 ) {
				// update the list of remaining nodes to attach, excluding any that were replaced by existing nodes
				nodes = this.nodes.slice( i );
			}

			// update the anchor to be the next occupant
			if ( occupants.length ) anchor = occupants[0];
		}

		// attach any remainging nodes to the parent
		if ( nodes.length ) {
			const frag = createDocumentFragment();
			nodes.forEach( n => frag.appendChild( n ) );

			if ( anchor ) {
				anchor.parentNode.insertBefore( frag, anchor );
			} else {
				parentNode.appendChild( frag );
			}
		}

		this.rendered = true;
	}

	toString () {
		let value = this.model && this.model.get();
		value = value != null ? '' + value : '';

		return inAttribute() ? decodeCharacterReferences( value ) : value;
	}

	unrender () {
		if ( this.nodes ) this.nodes.forEach( node => {
			// defer detachment until all relevant outros are done
			runloop.detachWhenReady( { node, detach() { detachNode( node ); } } );
		});
		this.rendered = false;
		this.nodes = null;
	}

	update () {
		if ( this.rendered && this.dirty ) {
			this.dirty = false;

			this.unrender();
			this.render();
		} else {
			// make sure to reset the dirty flag even if not rendered
			this.dirty = false;
		}
	}
}
