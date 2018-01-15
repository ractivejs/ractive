import runloop from 'src/global/runloop';
import { updateAnchors } from 'shared/anchors';
import { bind, render as callRender, unbind, unrender, update } from 'shared/methodCallers';
import { teardown } from 'src/Ractive/prototype/teardown';
import getRactiveContext from 'shared/getRactiveContext';
import { warnIfDebug } from 'utils/log';
import { createDocumentFragment } from 'utils/dom';
import { ANCHOR, ATTRIBUTE, BINDING_FLAG, COMPONENT, DECORATOR, EVENT, TRANSITION, YIELDER } from 'config/types';
import construct from 'src/Ractive/construct';
import initialise from 'src/Ractive/initialise';
import render from 'src/Ractive/render';
import Item from './shared/Item';
import ConditionalAttribute from './element/ConditionalAttribute';
import createItem from './createItem';
import parser from 'src/Ractive/config/runtime-parser';
import { assign, create } from 'utils/object';
import { isArray, isString } from 'utils/is';

export default class Component extends Item {
	constructor ( options, ComponentConstructor ) {
		super( options );
		let template = options.template;
		this.isAnchor = template.t === ANCHOR;
		this.type = this.isAnchor ? ANCHOR : COMPONENT; // override ELEMENT from super
		let attrs = template.m;

		const partials = template.p || {};
		if ( !( 'content' in partials ) ) partials.content = template.f || [];
		this._partials = partials; // TEMP

		if ( this.isAnchor ) {
			this.name = template.n;

			this.addChild = addChild;
			this.removeChild = removeChild;
		} else {
			const instance = create( ComponentConstructor.prototype );

			this.instance = instance;
			this.name = template.e;

			if ( instance.el ) {
				warnIfDebug( `The <${this.name}> component has a default 'el' property; it has been disregarded` );
			}

			// find container
			let fragment = options.up;
			let container;
			while ( fragment ) {
				if ( fragment.owner.type === YIELDER ) {
					container = fragment.owner.container;
					break;
				}

				fragment = fragment.parent;
			}

			// add component-instance-specific properties
			instance.parent = this.up.ractive;
			instance.container = container || null;
			instance.root = instance.parent.root;
			instance.component = this;

			construct( this.instance, { partials });

			// these can be modified during construction
			template = this.template;
			attrs = template.m;

			// allow components that are so inclined to add programmatic mappings
			if ( isArray( this.mappings ) ) {
				attrs = ( attrs || [] ).concat( this.mappings );
			} else if ( isString( this.mappings ) ) {
				attrs = ( attrs || [] ).concat( parser.parse( this.mappings, { attributes: true } ).t );
			}

			// for hackability, this could be an open option
			// for any ractive instance, but for now, just
			// for components and just for ractive...
			instance._inlinePartials = partials;
		}

		this.attributeByName = {};
		this.attributes = [];

		if (attrs) {
			const leftovers = [];
			attrs.forEach( template => {
				switch ( template.t ) {
					case ATTRIBUTE:
					case EVENT:
						this.attributes.push( createItem({
							owner: this,
							up: this.up,
							template
						}) );
						break;

					case TRANSITION:
					case BINDING_FLAG:
					case DECORATOR:
						break;

					default:
						leftovers.push( template );
						break;
				}
			});

			if ( leftovers.length ) {
				this.attributes.push( new ConditionalAttribute({
					owner: this,
					up: this.up,
					template: leftovers
				}) );
			}
		}

		this.eventHandlers = [];
	}

	bind () {
		if ( !this.isAnchor ) {
			this.attributes.forEach( bind );
			this.eventHandlers.forEach( bind );

			initialise( this.instance, {
				partials: this._partials
			}, {
				cssIds: this.up.cssIds
			});

			this.bound = true;
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.up.bubble();
		}
	}

	destroyed () {
		if ( !this.isAnchor && this.instance.fragment ) this.instance.fragment.destroyed();
	}

	detach () {
		if ( this.isAnchor ) {
			if ( this.instance ) return this.instance.fragment.detach();
			return createDocumentFragment();
		}

		return this.instance.fragment.detach();
	}

	find ( selector, options ) {
		if ( this.instance ) return this.instance.fragment.find( selector, options );
	}

	findAll ( selector, options ) {
		if ( this.instance ) this.instance.fragment.findAll( selector, options );
	}

	findComponent ( name, options ) {
		if ( !name || this.name === name ) return this.instance;

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name, options );
		}
	}

	findAllComponents ( name, options ) {
		const { result } = options;

		if ( this.instance && ( !name || this.name === name ) ) {
			result.push( this.instance );
		}

		if ( this.instance ) this.instance.findAllComponents( name, options );
	}

	firstNode ( skipParent ) {
		if ( this.instance ) return this.instance.fragment.firstNode( skipParent );
	}

	getContext ( ...assigns ) {
		assigns.unshift( this.instance );
		return getRactiveContext.apply( null, assigns );
	}

	render ( target, occupants ) {
		if ( this.isAnchor ) {
			this.rendered = true;
			this.target = target;

			if ( !checking.length ) {
				checking.push( this.ractive );
				if ( occupants ) {
					this.occupants = occupants;
					checkAnchors();
					this.occupants = null;
				} else {
					runloop.scheduleTask( checkAnchors, true );
				}
			}
		} else {

			this.attributes.forEach( callRender );
			this.eventHandlers.forEach( callRender );

			render( this.instance, target, null, occupants );

			this.rendered = true;
		}
	}

	shuffled () {
		super.shuffled();
		this.instance && !this.instance.isolated && this.instance.fragment && this.instance.fragment.shuffled();
	}

	toString () {
		if ( this.instance ) return this.instance.toHTML();
	}

	unbind () {
		if ( !this.isAnchor ) {
			this.bound = false;

			this.attributes.forEach( unbind );

			teardown( this.instance, () => runloop.promise() );
		}
	}

	unrender ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;

		if ( this.isAnchor ) {
			if ( this.item ) unrenderItem( this, this.item );
			this.target = null;
			if ( !checking.length ) {
				checking.push( this.ractive );
				runloop.scheduleTask( checkAnchors, true );
			}
		} else {
			this.instance.unrender();
			this.instance.el = this.instance.target = null;
			this.attributes.forEach( unrender );
			this.eventHandlers.forEach( unrender );
		}

		this.rendered = false;
	}

	update () {
		this.dirty = false;
		if ( this.instance ) {
			this.instance.fragment.update();
			this.attributes.forEach( update );
			this.eventHandlers.forEach( update );
		}
	}
}

function addChild ( meta ) {
	if ( this.item ) this.removeChild( this.item );

	const child = meta.instance;
	meta.anchor = this;

	meta.up = this.up;
	meta.name = meta.nameOption || this.name;
	this.name = meta.name;


	if ( !child.isolated ) child.viewmodel.attached( this.up );

	// render as necessary
	if ( this.rendered ) {
		renderItem( this, meta );
	}
}

function removeChild ( meta ) {
	// unrender as necessary
	if ( this.item === meta ) {
		unrenderItem( this, meta );
		this.name = this.template.n;
	}
}

function renderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = false;
	meta.up = anchor.up;

	anchor.item = meta;
	anchor.instance = meta.instance;
	const nextNode = anchor.up.findNextNode( anchor );

	if ( meta.instance.fragment.rendered ) {
		meta.instance.unrender();
	}

	meta.partials = meta.instance.partials;
	meta.instance.partials = assign( create( meta.partials ), meta.partials, anchor._partials );

	meta.instance.fragment.unbind();
	meta.instance.fragment.componentParent = anchor.up;
	meta.instance.fragment.bind( meta.instance.viewmodel );

	anchor.attributes.forEach( bind );
	anchor.eventHandlers.forEach( bind );
	anchor.attributes.forEach( callRender );
	anchor.eventHandlers.forEach( callRender );

	const target = anchor.up.findParentNode();
	render( meta.instance, target, target.contains( nextNode ) ? nextNode : null, anchor.occupants );

	if ( meta.lastBound !== anchor ) {
		meta.lastBound = anchor;
	}
}

function unrenderItem ( anchor, meta ) {
	if ( !anchor.rendered ) return;

	meta.shouldDestroy = true;
	meta.instance.unrender();

	anchor.eventHandlers.forEach( unrender );
	anchor.attributes.forEach( unrender );
	anchor.eventHandlers.forEach( unbind );
	anchor.attributes.forEach( unbind );

	meta.instance.el = meta.instance.anchor = null;
	meta.instance.fragment.componentParent = null;
	meta.up = null;
	meta.anchor = null;
	anchor.item = null;
	anchor.instance = null;
}

let checking = [];
export function checkAnchors () {
	const list = checking;
	checking = [];

	list.forEach( updateAnchors );
}
