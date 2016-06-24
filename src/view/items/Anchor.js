import Item from './shared/Item';
import { createDocumentFragment } from '../../utils/dom';
import { addToArray, removeFromArray } from '../../utils/array';
import render from '../../Ractive/render';
import runloop from '../../global/runloop';

// when anchors appear, register and find children that want to be there
// when achors disappear, unrender children and release them back to the pool

export default class Anchor extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;
		this.multi = options.template.m;

		this.ractive = this.parentFragment.ractive;

		this.items = [];
		this.activeItems = [];

		this.liveQueries = [];
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
		this.items.forEach( item => docFrag.appendChild( item.detach() ) );
		return docFrag;
	}

	find ( selector ) {
		const items = this.activeItems;

		for ( let i = 0; i < items.length; i++ ) {
			const node = items[i].ractive.fragment.find( selector );
			if ( node ) return node;
		}
	}

	findAll ( selector, query ) {
		const items = this.activeItems;

		for ( let i = 0; i < items.length; i++ ) {
			items[i].ractive.fragment.findAll( selector, query );
		}

		return query;
	}

	findComponent ( name ) {
		if ( !name && this.items.length ) return this.items[0].ractive;

		for ( let i = 0; i < this.items.length; i++ ) {
			if ( this.items[i].name === name ) return this.items[i].ractive;
			const child = this.items[i].ractive.findComponent( name );
			if ( child ) return child;
		}
	}

	findAllComponents ( name, query ) {
		this.activeItems.forEach( i => {
			if ( query.test( i ) ) query.add( i.ractive );

			if ( query.live ) this.liveQueries.push( query );

			i.ractive.fragment.findAllComponents( name, query );
		});
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
		this.items.forEach( i => i.ractive.fragment.update() );
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

	if ( meta.ractive.fragment.rendered ) meta.ractive.unrender();
	render( meta.ractive, anchor.target, anchor.target.contains( nextNode ) ? nextNode : null );

	if ( meta.lastBound !== anchor ) {
		meta.lastBound = anchor;
		runloop.forceRebind();
		meta.ractive.fragment.rebind( meta.ractive.viewmodel );
	}
}

function unrenderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	removeFromArray( anchor.activeItems, meta );
	meta.shouldDestroy = true;
	meta.ractive.unrender();
	meta.ractive.el = meta.ractive.anchor = null;
	meta.parentFragment = null;
}
