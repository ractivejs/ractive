import { ELEMENT } from 'config/types';
import runloop from 'global/runloop';
import createItem from './items/createItem';
import createResolver from './resolvers/createResolver';
import { bind, unbind, unrender, update, toEscapedString, toString } from 'shared/methodCallers';
import processItems from './helpers/processItems';
import parseJSON from 'utils/parseJSON';

function unrenderAndDestroy ( item ) {
	item.unrender( true );
}

export default class Fragment {
	constructor ( options ) {
		this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute

		this.isRoot = !options.owner.parentFragment;
		this.parent = this.isRoot ? null : this.owner.parentFragment;
		this.ractive = options.ractive || ( this.isRoot ? options.owner : this.parent.ractive );

		this.componentParent = ( this.isRoot && this.ractive.component ) ? this.ractive.component.parentFragment : null;

		this.context = null;
		this.rendered = false;
		this.indexRefs = options.indexRefs || this.parent.indexRefs;
		this.keyRefs = options.keyRefs || this.parent.keyRefs;

		this.resolvers = [];

		this.dirtyArgs = this.dirtyValue = true; // TODO getArgsList is nonsense - should deprecate legacy directives style

		this.template = options.template || [];
		this.createItems();
	}

	bind ( context ) {
		this.context = context;
		this.items.forEach( bind );
		this.bound = true;

		return this;
	}

	bubble () {
		this.dirtyArgs = this.dirtyValue = true;

		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.isRoot ) { // TODO encapsulate 'is component root, but not overall root' check?
				if ( this.ractive.component ) {
					this.ractive.component.bubble();
				} else {
					runloop.addFragment( this );
				}
			} else {
				this.owner.bubble();
			}
		}
	}

	createItems () {
		this.items = this.template.map( ( template, index ) => {
			return createItem({ parentFragment: this, template, index });
		});
	}

	detach () {
		const docFrag = document.createDocumentFragment();
		this.items.forEach( item => docFrag.appendChild( item.detach() ) );
		return docFrag;
	}

	find ( selector ) {
		const len = this.items.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const found = this.items[i].find( selector );
			if ( found ) return found;
		}
	}

	findAll ( selector, queryResult ) {
		if ( this.items ) {
			const len = this.items.length;
			let i;

			for ( i = 0; i < len; i += 1 ) {
				const item = this.items[i];

				if ( item.findAll ) {
					item.findAll( selector, queryResult );
				}
			}
		}

		return queryResult;
	}

	findComponent ( name ) {
		const len = this.items.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const found = this.items[i].findComponent( name );
			if ( found ) return found;
		}
	}

	findAllComponents ( name, queryResult ) {
		if ( this.items ) {
			const len = this.items.length;
			let i;

			for ( i = 0; i < len; i += 1 ) {
				const item = this.items[i];

				if ( item.findAllComponents ) {
					item.findAllComponents( name, queryResult );
				}
			}
		}

		return queryResult;
	}

	findContext () {
		let fragment = this;
		while ( !fragment.context ) fragment = fragment.parent;
		return fragment.context;
	}

	findNextNode ( item ) {
		const nextItem = this.items[ item.index + 1 ];

		if ( nextItem ) return nextItem.firstNode();

		// if this is the root fragment, and there are no more items,
		// it means we're at the end...
		if ( this.isRoot ) {
			if ( this.ractive.component ) {
				return this.ractive.component.parentFragment.findNextNode( this.ractive.component );
			}

			// TODO possible edge case with other content
			// appended to this.ractive.el?
			return null;
		}

		return this.owner.findNextNode();
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

			fragment = fragment.componentParent || fragment.parent; // TODO ugh
		} while ( fragment );

		throw new Error( 'Could not find parent node' ); // TODO link to issue tracker
	}

	firstNode () {
		return this.items[0] ? this.items[0].firstNode() : this.parent.findNextNode( this.owner );
	}

	// TODO ideally, this would be deprecated in favour of an
	// expression-like approach
	getArgsList () {
		if ( this.dirtyArgs ) {
			const values = {};
			const source = processItems( this.items, values, this.ractive._guid );
			const parsed = parseJSON( '[' + source + ']', values );

			this.argsList = parsed ?
				parsed.value :
				[ this.toString() ];

			this.dirtyArgs = false;
		}

		return this.argsList;
	}

	render () {
		if ( this.rendered ) throw new Error( 'Fragment is already rendered!' );
		this.rendered = true;

		// fast path
		if ( this.items.length === 1 ) {
			return this.items[0].render();
		}

		const docFrag = document.createDocumentFragment();
		this.items.forEach( item => docFrag.appendChild( item.render() ) );

		return docFrag;
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
				const anchor = null; // TODO!!!

				parentNode.insertBefore( this.render(), anchor );
			}
		}
	}

	resolve ( template, callback ) {
		if ( !this.context ) {
			return this.parent.resolve( template, callback );
		}

		const resolver = createResolver( this, template, callback );
		this.resolvers.push( resolver );
	}

	toHtml () {
		return this.toString();
	}

	toString ( escape ) {
		return this.items.map( escape ? toEscapedString : toString ).join( '' );
	}

	unbind () {
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
			this.items.forEach( update );
			this.dirty = false;
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
