import runloop from '../../global/runloop';
import { warnIfDebug } from '../../utils/log';
import { ATTRIBUTE, BINDING_FLAG, COMPONENT, DECORATOR, EVENT, TRANSITION, YIELDER } from '../../config/types';
import Item from './shared/Item';
import ConditionalAttribute from './element/ConditionalAttribute';
import construct from '../../Ractive/construct';
import initialise from '../../Ractive/initialise';
import render from '../../Ractive/render';
import { create } from '../../utils/object';
import createItem from './createItem';
import { removeFromArray } from '../../utils/array';
import { bind, cancel, rebind, render as callRender, unbind, unrender, update } from '../../shared/methodCallers';
import Hook from '../../events/Hook';
import EventDirective from './shared/EventDirective';
import RactiveEvent from './component/RactiveEvent';
import updateLiveQueries from './component/updateLiveQueries';

function removeFromLiveComponentQueries ( component ) {
	let instance = component.ractive;

	while ( instance ) {
		const query = instance._liveComponentQueries[ `_${component.name}` ];
		if ( query ) query.remove( component );

		instance = instance.parent;
	}
}

function makeDirty ( query ) {
	query.makeDirty();
}

const teardownHook = new Hook( 'teardown' );

export default class Component extends Item {
	constructor ( options, ComponentConstructor ) {
		super( options );
		this.type = COMPONENT; // override ELEMENT from super

		const instance = create( ComponentConstructor.prototype );

		this.instance = instance;
		this.name = options.template.e;
		this.parentFragment = options.parentFragment;

		this.liveQueries = [];

		if ( instance.el ) {
			warnIfDebug( `The <${this.name}> component has a default 'el' property; it has been disregarded` );
		}

		let partials = options.template.p || {};
		if ( !( 'content' in partials ) ) partials.content = options.template.f || [];
		this._partials = partials; // TEMP

		this.yielders = {};

		// find container
		let fragment = options.parentFragment;
		let container;
		while ( fragment ) {
			if ( fragment.owner.type === YIELDER ) {
				container = fragment.owner.container;
				break;
			}

			fragment = fragment.parent;
		}

		// add component-instance-specific properties
		instance.parent = this.parentFragment.ractive;
		instance.container = container || null;
		instance.root = instance.parent.root;
		instance.component = this;

		construct( this.instance, { partials });

		// for hackability, this could be an open option
		// for any ractive instance, but for now, just
		// for components and just for ractive...
		instance._inlinePartials = partials;

		this.attributeByName = {};

		this.attributes = [];
		( this.template.m || [] ).forEach( template => {
			switch ( template.t ) {
				case ATTRIBUTE:
				case EVENT:
				case TRANSITION:
					this.attributes.push( createItem({
						owner: this,
						parentFragment: this.parentFragment,
						template
					}) );
					break;

				case BINDING_FLAG:
				case DECORATOR:
					break;

				default:
					this.attributes.push( new ConditionalAttribute({
						owner: this,
						parentFragment: this.parentFragment,
						template
					}) );
					break;
			}
		});

		this.eventHandlers = [];
		if ( this.template.v ) this.setupEvents();
	}

	bind () {
		this.attributes.forEach( bind );

		initialise( this.instance, {
			partials: this._partials
		}, {
			cssIds: this.parentFragment.cssIds
		});

		this.eventHandlers.forEach( bind );

		this.bound = true;
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	checkYielders () {
		Object.keys( this.yielders ).forEach( name => {
			if ( this.yielders[ name ].length > 1 ) {
				runloop.end();
				throw new Error( `A component template can only have one {{yield${name ? ' ' + name : ''}}} declaration at a time` );
			}
		});
	}

	detach () {
		return this.instance.fragment.detach();
	}

	find ( selector ) {
		return this.instance.fragment.find( selector );
	}

	findAll ( selector, query ) {
		this.instance.fragment.findAll( selector, query );
	}

	findComponent ( name ) {
		if ( !name || this.name === name ) return this.instance;

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, query ) {
		if ( query.test( this ) ) {
			query.add( this.instance );

			if ( query.live ) {
				this.liveQueries.push( query );
			}
		}

		this.instance.fragment.findAllComponents( name, query );
	}

	firstNode ( skipParent ) {
		return this.instance.fragment.firstNode( skipParent );
	}

	rebind () {
		// implicit mappings can cause issues during shuffles, so remap everythiing as necessary
		// TODO: it's probably better not to throw ALL of the mappings away on rebind
		this.instance.viewmodel.resetMappings();

		this.attributes.forEach( rebind );

		this.liveQueries.forEach( makeDirty );

		this.instance.fragment.rebind( this.instance.viewmodel );
	}

	render ( target, occupants ) {
		render( this.instance, target, null, occupants );

		this.checkYielders();
		this.attributes.forEach( callRender );
		this.eventHandlers.forEach( callRender );
		updateLiveQueries( this );

		this.rendered = true;
	}

	setupEvents () {
		const handlers = this.eventHandlers;

		Object.keys( this.template.v ).forEach( key => {
			const eventNames = key.split( '-' );
			const template = this.template.v[ key ];

			eventNames.forEach( eventName => {
				const event = new RactiveEvent( this.instance, eventName );
				handlers.push( new EventDirective( this, event, template ) );
			});
		});
	}

	toString () {
		return this.instance.toHTML();
	}

	unbind () {
		this.bound = false;

		this.attributes.forEach( unbind );

		const instance = this.instance;
		instance.viewmodel.teardown();
		instance.fragment.unbind();
		instance._observers.forEach( cancel );

		removeFromLiveComponentQueries( this );

		if ( instance.fragment.rendered && instance.el.__ractive_instances__ ) {
			removeFromArray( instance.el.__ractive_instances__, instance );
		}

		Object.keys( instance._links ).forEach( k => instance._links[k].unlink() );

		teardownHook.fire( instance );
	}

	unrender ( shouldDestroy ) {
		this.rendered = false;

		this.shouldDestroy = shouldDestroy;
		this.instance.unrender();
		this.attributes.forEach( unrender );
		this.eventHandlers.forEach( unrender );
		this.liveQueries.forEach( query => query.remove( this.instance ) );
	}

	update () {
		this.dirty = false;
		this.instance.fragment.update();
		this.checkYielders();
		this.attributes.forEach( update );
		this.eventHandlers.forEach( update );
	}
}
