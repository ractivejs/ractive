import Item from './shared/Item';
import { createDocumentFragment } from '../../utils/dom';
import { addToArray, removeFromArray } from '../../utils/array';
import render from '../../Ractive/render';
import updateLiveQueries from './component/updateLiveQueries';
import resolve from '../resolvers/resolve';
import runloop from '../../global/runloop';
import { updateAnchors } from '../../shared/anchors';

var checking = [];
export function checkAnchors () {
	const list = checking;
	checking = [];

	list.forEach( updateAnchors );
}

export default class Anchor extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;
		this.mappings = options.template.a;

		this.ractive = this.parentFragment.ractive;
	}

	addChild ( meta ) {
		if ( this.item ) this.removeChild( this.item );
		meta.anchor = this;

		meta.parentFragment = this.parentFragment;
		meta.name = meta.nameOption || this.name;

		// set up anchor mappings
		const root = meta.instance.viewmodel;
		if ( !meta.mappings ) meta.mappings = {};
		for ( const k in this.mappings ) {
			if ( !root.has( k ) ) {
				const target = resolve( meta.parentFragment, this.mappings[k] );
				if ( target ) {
					meta.mappings[k] = target;
					root.joinKey( k ).link( target );
				}
			}
		}

		if ( !meta.instance.isolated ) meta.instance.viewmodel.attached( this.parentFragment );

		// render as necessary
		if ( this.rendered ) {
			renderItem( this, meta );
		}
	}

	bind () {}

	detach () {
		const docFrag = createDocumentFragment();
		if ( this.item ) docFrag.appendChild( this.item.instance.fragment.detach() );
		return docFrag;
	}

	find ( selector, options ) {
		if ( this.item ) return this.item.instance.find( selector, options );
	}

	findAll ( selector, query ) {
		if ( this.item ) return this.item.instance.findAll( selector, { _query: query } );
	}

	findComponent ( name ) {
		if ( !name || ( this.item && this.item.name === name ) ) return this.item.instance;
	}

	findAllComponents ( name, query ) {
		if ( this.item ) {
			if ( query.test( this.item ) ) {
				query.add( this.item.instance );
				if ( query.live ) this.item.liveQueries.push( query );
			}
			this.item.instance.findAllComponents( name, { _query: query } );
		}
	}

	firstNode () {
		if ( this.item ) this.item.instance.fragment.firstNode();
	}

	removeChild ( meta ) {
		// unrender as necessary
		if ( this.item === meta ) {
		   unrenderItem( this, meta );
			removeMappings( meta );
		}

	}

	render ( target ) {
		this.target = target;

		this.rendered = true;
		if ( !checking.length ) {
			checking.push( this.ractive );
			runloop.scheduleTask( checkAnchors, true );
		}
	}

	unbind () {}

	update () {
		this.dirty = false;
		if ( this.item ) this.item.instance.fragment.update();
	}

	unrender ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;

		if ( this.item ) unrenderItem( this, this.item );

		this.rendered = false;
		this.target = null;
	}
}

Anchor.prototype.isAnchor = true;

function renderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = false;
	meta.parentFragment = anchor.parentFragment;

	anchor.item = meta;
	const nextNode = anchor.parentFragment.findNextNode( anchor );

	if ( meta.instance.fragment.rendered ) meta.instance.unrender();
	const target = anchor.parentFragment.findParentNode();
	render( meta.instance, target, target.contains( nextNode ) ? nextNode : null );

	if ( meta.lastBound !== anchor ) {
		meta.lastBound = anchor;
	}

	updateLiveQueries( meta );
}

function unrenderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = true;
	meta.instance.unrender();
	meta.instance.el = meta.instance.anchor = null;
	meta.parentFragment = null;
	meta.anchor = null;
	removeMappings( meta );
	anchor.item = null;

	meta.liveQueries.forEach( q => q.remove( meta.instance ) );
	meta.liveQueries = [];
}

function removeMappings ( meta ) {
	// remove anchor mappings
	const root = meta.instance.viewmodel;
	for ( const k in meta.mappings ) {
		const model = root.joinKey( k, { lastLink: false } );
		if ( model._link && model._link.target === meta.mappings[k] ) {
			model.unlink();
		}
	}
}
