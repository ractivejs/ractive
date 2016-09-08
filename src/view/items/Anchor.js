import Item from './shared/Item';
import { createDocumentFragment } from '../../utils/dom';
import { addToArray, removeFromArray } from '../../utils/array';
import render from '../../Ractive/render';
import updateLiveQueries from './component/updateLiveQueries';

export default class Anchor extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;
		this.multi = options.template.m;

		this.ractive = this.parentFragment.ractive;

		this.items = [];
		this.activeItems = [];
	}

	addChild ( meta ) {
		addToArray( this.items, meta );

		meta.parentFragment = this.parentFragment;

		// render/unrender as necessary
		if ( this.multi || !this.activeItems.length ) {
			renderItem( this, meta );
		} else if ( !this.multi ) {
			unrenderItem( this, this.activeItems[0] );
			renderItem( this, meta );
		}
	}

	bind () {
		addToArray( this.ractive._anchors, this );
	}

	detach () {
		const docFrag = createDocumentFragment();
		this.activeItems.forEach( i => docFrag.appendChild( i.instance.fragment.detach() ) );
		return docFrag;
	}

	find ( selector, options ) {
		const items = this.activeItems;

		for ( let i = 0; i < items.length; i++ ) {
			const found = items[i].instance.find( selector, options );
			if ( found ) return found;
		}
	}

	findAll ( selector, query ) {
		const items = this.activeItems;

		for ( let i = 0; i < items.length; i++ ) {
			items[i].instance.findAll( selector, { _query: query } );
		}

		return query;
	}

	findComponent ( name, options ) {
		const items = options.remote ? this.items : this.activeItems;

		if ( !name && items.length ) return items[0].instance;

		for ( let i = 0; i < items.length; i++ ) {
			if ( items[i].name === name ) return items[i].instance;
			const found = items[i].instance.findComponent( name, options );
			if ( found ) return found;
		}
	}

	findAllComponents ( name, query ) {
		const items = query.remote ? this.items : this.activeItems;

		items.forEach( i => {
			if ( query.test( i ) ) {
				query.add( i.instance );
				if ( query.live ) i.liveQueries.push( query );
			}

			i.instance.findAllComponents( name, { _query: query } );
		});
	}

	firstNode () {
		for ( let i = 0; i < this.activeItems.length; i++ ) {
			const node = this.activeItems[i].instance.fragment.firstNode();
			if ( node ) return node;
		}
	}

	rebind () {
		this.items.forEach( i => i.instance.fragment.rebind() );
	}

	removeChild ( meta ) {
		removeFromArray( this.items, meta );

		// unrender/render as necessary
		if ( ~this.activeItems.indexOf( meta ) ) unrenderItem( this, meta );

		if ( !this.multi && this.items.length ) {
			renderItem( this, this.items[ this.items.length - 1 ] );
		}
	}

	render ( target ) {
		this.rendered = true;
		this.target = target;

		// collect children that should live here
		const items = this.ractive._children;
		items.forEach( i => {
			if ( i.target === this.name ) {
				this.items.push( i );
				i.anchor = this;
			}
		});

		if ( this.multi ) {
			this.items.forEach( i => renderItem( this, i ) );
		} else if ( this.items.length ) {
			renderItem( this, this.items[ this.items.length - 1 ] );
		}
	}

	unbind () {
		removeFromArray( this.ractive._anchors, this );
	}

	update () {
		this.dirty = false;
		this.items.forEach( i => i.instance.fragment.update() );
	}

	unrender ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;

		this.activeItems.forEach( i => unrenderItem( this, i ) );

		this.rendered = false;
		this.target = null;

		this.items.forEach( i => {
			if ( i.anchor === this ) i.anchor = null;
		});
		this.items = [];
	}
}

function renderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = false;
	meta.parentFragment = anchor.parentFragment;

	anchor.activeItems.push( meta );
	const nextNode = anchor.parentFragment.findNextNode( anchor );

	if ( meta.instance.fragment.rendered ) meta.instance.unrender();
	render( meta.instance, anchor.target, anchor.target.contains( nextNode ) ? nextNode : null );

	if ( meta.lastBound !== anchor ) {
		meta.lastBound = anchor;
	}

	updateLiveQueries( meta );
}

function unrenderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	removeFromArray( anchor.activeItems, meta );
	meta.shouldDestroy = true;
	meta.instance.unrender();
	meta.instance.el = meta.instance.anchor = null;
	meta.parentFragment = null;

	meta.liveQueries.forEach( q => q.remove( meta.instance ) );
	meta.liveQueries = [];
}

