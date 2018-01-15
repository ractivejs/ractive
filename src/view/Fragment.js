import { ELEMENT, YIELDER } from 'config/types';
import runloop from 'src/global/runloop';
import { findMap } from 'utils/array';
import { getContext, findParentWithContext } from 'shared/getRactiveContext';
import { bind, destroyed, shuffled, toEscapedString, toString, unbind, unrender, update } from 'shared/methodCallers';
import createItem from './items/createItem';
import processItems from './helpers/processItems';
import parseJSON from 'utils/parseJSON';
import { createDocumentFragment } from 'utils/dom';
import KeyModel from 'src/model/specials/KeyModel';

function unrenderAndDestroy ( item ) {
	item.unrender( true );
}

export default class Fragment {
	constructor ( options ) {
		this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute

		this.isRoot = !options.owner.up;
		this.parent = this.isRoot ? null : this.owner.up;
		this.ractive = options.ractive || ( this.isRoot ? options.owner : this.parent.ractive );

		this.componentParent = ( this.isRoot && this.ractive.component ) ? this.ractive.component.up : null;
		this.delegate = ( this.parent ? this.parent.delegate : ( this.componentParent && this.componentParent.delegate ) ) ||
			( this.owner.containerFragment && this.owner.containerFragment.delegate );

		this.context = null;
		this.rendered = false;

		// encapsulated styles should be inherited until they get applied by an element
		if ( 'cssIds' in options ) {
			this.cssIds = options.cssIds && options.cssIds.length && options.cssIds;
		} else {
			this.cssIds = this.parent ? this.parent.cssIds : null;
		}

		this.dirty = false;
		this.dirtyValue = true; // used for attribute values

		this.template = options.template || [];
		this.createItems();
	}

	bind ( context ) {
		this.context = context;
		this.items.forEach( bind );
		this.bound = true;

		// in rare cases, a forced resolution (or similar) will cause the
		// fragment to be dirty before it's even finished binding. In those
		// cases we update immediately
		if ( this.dirty ) this.update();

		return this;
	}

	bubble () {
		this.dirtyValue = true;

		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.isRoot ) { // TODO encapsulate 'is component root, but not overall root' check?
				if ( this.ractive.component ) {
					this.ractive.component.bubble();
				} else if ( this.bound ) {
					runloop.addFragment( this );
				}
			} else {
				this.owner.bubble( this.index );
			}
		}
	}

	createItems () {
		// this is a hot code path
		const max = this.template.length;
		this.items = [];
		for ( let i = 0; i < max; i++ ) {
			this.items[i] = createItem({ up: this, template: this.template[i], index: i });
		}
	}

	destroyed () {
		this.items.forEach( destroyed );
	}

	detach () {
		const docFrag = createDocumentFragment();
		const xs = this.items;
		const len = xs.length;
		for ( let i = 0; i < len; i++ ) {
			docFrag.appendChild( xs[i].detach() );
		}
		return docFrag;
	}

	find ( selector, options ) {
		return findMap( this.items, i => i.find( selector, options ) );
	}

	findAll ( selector, options ) {
		if ( this.items ) {
			this.items.forEach( i => i.findAll && i.findAll( selector, options ) );
		}
	}

	findComponent ( name, options ) {
		return findMap( this.items, i => i.findComponent( name, options ) );
	}

	findAllComponents ( name, options ) {
		if ( this.items ) {
			this.items.forEach( i => i.findAllComponents && i.findAllComponents( name, options ) );
		}
	}

	findContext () {
		const base = findParentWithContext( this );
		if ( !base || !base.context ) return this.ractive.viewmodel;
		else return base.context;
	}

	findNextNode ( item ) {
		// search for the next node going forward
		if ( item ) {
			let it;
			for ( let i = item.index + 1; i < this.items.length; i++ ) {
				it = this.items[i];
				if ( !it || !it.firstNode ) continue;

				const node = it.firstNode( true );
				if ( node ) return node;
			}
		}

		// if this is the root fragment, and there are no more items,
		// it means we're at the end...
		if ( this.isRoot ) {
			if ( this.ractive.component ) {
				return this.ractive.component.up.findNextNode( this.ractive.component );
			}

			// TODO possible edge case with other content
			// appended to this.ractive.el?
			return null;
		}

		if ( this.parent ) return this.owner.findNextNode( this ); // the argument is in case the parent is a RepeatedFragment
	}

	findParentNode () {
		let fragment = this;

		do {
			if ( fragment.owner.type === ELEMENT ) {
				return fragment.owner.node;
			}

			if ( fragment.isRoot && !fragment.ractive.component ) { // TODO encapsulate check
				return fragment.ractive.el;
			}

			if ( fragment.owner.type === YIELDER ) {
				fragment = fragment.owner.containerFragment;
			} else {
				fragment = fragment.componentParent || fragment.parent; // TODO ugh
			}
		} while ( fragment );

		throw new Error( 'Could not find parent node' ); // TODO link to issue tracker
	}

	firstNode ( skipParent ) {
		const node = findMap( this.items, i => i.firstNode( true ) );
		if ( node ) return node;
		if ( skipParent ) return null;

		return this.parent.findNextNode( this.owner );
	}

	getKey () {
		return this.keyModel || ( this.keyModel = new KeyModel( this.key, this.context ) );
	}

	getKeypath ( root ) {
		if ( root ) {
			return this.rootModel || ( this.rootModel = new KeyModel( this.context.getKeypath( this.ractive.root ), this.context ) );
		} else {
			return this.pathModel || ( this.pathModel = new KeyModel( this.context.getKeypath(), this.context ) );
		}
	}

	getIndex () {
		return this.idxModel || ( this.idxModel = new KeyModel( this.index, this.context ) );
	}

	rebind ( next ) {
		this.context = next;
	}

	render ( target, occupants ) {
		if ( this.rendered ) throw new Error( 'Fragment is already rendered!' );
		this.rendered = true;

		const xs = this.items;
		const len = xs.length;
		for ( let i = 0; i < len; i++ ) {
			xs[i].render( target, occupants );
		}
	}

	resetTemplate ( template ) {
		const wasBound = this.bound;
		const wasRendered = this.rendered;

		// TODO ensure transitions are disabled globally during reset

		if ( wasBound ) {
			if ( wasRendered ) this.unrender( true );
			this.unbind();
		}

		this.template = template;
		this.createItems();

		if ( wasBound ) {
			this.bind( this.context );

			if ( wasRendered ) {
				const parentNode = this.findParentNode();
				const anchor = this.findNextNode();

				if ( anchor ) {
					const docFrag = createDocumentFragment();
					this.render( docFrag );
					parentNode.insertBefore( docFrag, anchor );
				} else {
					this.render( parentNode );
				}
			}
		}
	}

	shuffled () {
		this.items.forEach( shuffled );
		if ( this.rootModel ) this.rootModel.applyValue( this.context.getKeypath( this.ractive.root ) );
		if ( this.pathModel ) this.pathModel.applyValue( this.context.getKeypath() );
	}

	toString ( escape ) {
		return this.items.map( escape ? toEscapedString : toString ).join( '' );
	}

	unbind () {
		this.context = null;
		this.items.forEach( unbind );
		this.bound = false;

		return this;
	}

	unrender ( shouldDestroy ) {
		this.items.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			if ( !this.updating ) {
				this.dirty = false;
				this.updating = true;
				this.items.forEach( update );
				this.updating = false;
			} else if ( this.isRoot ) {
				runloop.addFragmentToRoot( this );
			}
		}
	}

	valueOf () {
		if ( this.items.length === 1 ) {
			return this.items[0].valueOf();
		}

		if ( this.dirtyValue ) {
			const values = {};
			const source = processItems( this.items, values, this.ractive._guid );
			const parsed = parseJSON( source, values );

			this.value = parsed ?
				parsed.value :
				this.toString();

			this.dirtyValue = false;
		}

		return this.value;
	}
}
Fragment.prototype.getContext = getContext;
