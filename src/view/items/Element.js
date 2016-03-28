import { ELEMENT } from '../../config/types';
import runloop from '../../global/runloop';
import Item from './shared/Item';
import Fragment from '../Fragment';
import Attribute from './element/Attribute';
import ConditionalAttribute from './element/ConditionalAttribute';
import Decorator from './element/Decorator';
import EventDirective from './shared/EventDirective';
import { findInViewHierarchy } from '../../shared/registry';
import { DOMEvent, CustomEvent } from './element/ElementEvents';
import Transition from './element/Transition';
import updateLiveQueries from './element/updateLiveQueries';
import { toArray } from '../../utils/array';
import { escapeHtml, voidElementNames } from '../../utils/html';
import { bind, rebind, render, unbind, unrender, update } from '../../shared/methodCallers';
import { createElement, detachNode, matches } from '../../utils/dom';
import { html, svg } from '../../config/namespaces';
import { defineProperty } from '../../utils/object';
import selectBinding from './element/binding/selectBinding';

function makeDirty ( query ) {
	query.makeDirty();
}

export default class Element extends Item {
	constructor ( options ) {
		super( options );

		this.liveQueries = []; // TODO rare case. can we handle differently?

		this.name = options.template.e.toLowerCase();
		this.isVoid = voidElementNames.test( this.name );

		// find parent element
		let fragment = this.parentFragment;
		while ( fragment ) {
			if ( fragment.owner.type === ELEMENT ) {
				this.parent = fragment.owner;
				break;
			}
			fragment = fragment.parent;
		}

		if ( this.parent && this.parent.name === 'option' ) {
			throw new Error( `An <option> element cannot contain other elements (encountered <${this.name}>)` );
		}

		// create attributes
		this.attributeByName = {};
		this.attributes = [];

		if ( this.template.a ) {
			Object.keys( this.template.a ).forEach( name => {
				// TODO process this at parse time
				if ( name === 'twoway' || name === 'lazy' ) return;

				const attribute = new Attribute({
					name,
					element: this,
					parentFragment: this.parentFragment,
					template: this.template.a[ name ]
				});

				this.attributeByName[ name ] = attribute;

				if ( name !== 'value' && name !== 'type' ) this.attributes.push( attribute );
			});

			if ( this.attributeByName.type ) this.attributes.unshift( this.attributeByName.type );
			if ( this.attributeByName.value ) this.attributes.push( this.attributeByName.value );
		}

		// create conditional attributes
		this.conditionalAttributes = ( this.template.m || [] ).map( template => {
			return new ConditionalAttribute({
				owner: this,
				parentFragment: this.parentFragment,
				template
			});
		});

		// create decorator
		if ( this.template.o ) {
			this.decorator = new Decorator( this, this.template.o );
		}

		// attach event handlers
		this.eventHandlers = [];
		if ( this.template.v ) {
			Object.keys( this.template.v ).forEach( key => {
				const eventNames = key.split( '-' );
				const template = this.template.v[ key ];

				eventNames.forEach( eventName => {
					const fn = findInViewHierarchy( 'events', this.ractive, eventName );
					// we need to pass in "this" in order to get
					// access to node when it is created.
					const event = fn ? new CustomEvent( fn, this ) : new DOMEvent( eventName, this );
					this.eventHandlers.push( new EventDirective( this, event, template ) );
				});
			});
		}

		// create children
		if ( options.template.f && !options.noContent ) {
			this.fragment = new Fragment({
				template: options.template.f,
				owner: this,
				cssIds: null
			});
		}

		this.binding = null; // filled in later
	}

	bind () {
		this.attributes.forEach( bind );
		this.conditionalAttributes.forEach( bind );
		this.eventHandlers.forEach( bind );

		if ( this.decorator ) this.decorator.bind();
		if ( this.fragment ) this.fragment.bind();

		// create two-way binding if necessary
		if ( this.binding = this.createTwowayBinding() ) this.binding.bind();
	}

	createTwowayBinding () {
		const attributes = this.template.a;

		if ( !attributes ) return null;

		const shouldBind = 'twoway' in attributes ?
			attributes.twoway === 0 || attributes.twoway === 'true' : // covers `twoway` and `twoway='true'`
			this.ractive.twoway;

		if ( !shouldBind ) return null;

		const Binding = selectBinding( this );

		if ( !Binding ) return null;

		const binding = new Binding( this );

		return binding && binding.model ?
			binding :
			null;
	}

	detach () {
		if ( this.decorator ) this.decorator.unrender();
		return detachNode( this.node );
	}

	find ( selector ) {
		if ( matches( this.node, selector ) ) return this.node;
		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	}

	findAll ( selector, query ) {
		// Add this node to the query, if applicable, and register the
		// query on this element
		const matches = query.test( this.node );
		if ( matches ) {
			query.add( this.node );
			if ( query.live ) this.liveQueries.push( query );
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	}

	findComponent ( name ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, query ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( name, query );
		}
	}

	findNextNode () {
		return null;
	}

	firstNode () {
		return this.node;
	}

	getAttribute ( name ) {
		const attribute = this.attributeByName[ name ];
		return attribute ? attribute.getValue() : undefined;
	}

	rebind () {
		this.attributes.forEach( rebind );
		this.conditionalAttributes.forEach( rebind );
		this.eventHandlers.forEach( rebind );
		if ( this.decorator ) this.decorator.rebind();
		if ( this.fragment ) this.fragment.rebind();
		if ( this.binding ) this.binding.rebind();

		this.liveQueries.forEach( makeDirty );
	}

	render ( target, occupants ) {
		// TODO determine correct namespace
		this.namespace = getNamespace( this );

		let node;
		let existing = false;

		if ( occupants ) {
			let n;
			while ( ( n = occupants.shift() ) ) {
				if ( n.nodeName === this.template.e.toUpperCase() && n.namespaceURI === this.namespace ) {
					this.node = node = n;
					existing = true;
					break;
				} else {
					detachNode( n );
				}
			}
		}

		if ( !node ) {
			node = createElement( this.template.e, this.namespace, this.getAttribute( 'is' ) );
			this.node = node;
		}

		defineProperty( node, '_ractive', {
			value: {
				proxy: this,
				fragment: this.parentFragment
			}
		});

		// Is this a top-level node of a component? If so, we may need to add
		// a data-ractive-css attribute, for CSS encapsulation
		if ( this.parentFragment.cssIds ) {
			node.setAttribute( 'data-ractive-css', this.parentFragment.cssIds.map( x => `{${x}}` ).join( ' ' ) );
		}

		if ( existing && this.foundNode ) this.foundNode( node );

		if ( this.fragment ) {
			const children = existing ? toArray( node.childNodes ) : undefined;
			this.fragment.render( node, children );

			// clean up leftover children
			if ( children ) {
				children.forEach( detachNode );
			}
		}

		if ( existing ) {
			// store initial values for two-way binding
			if ( this.binding && this.binding.wasUndefined ) this.binding.setFromNode( node );

			// remove unused attributes
			let i = node.attributes.length;
			while ( i-- ) {
				const name = node.attributes[i].name;
				if ( !this.template.a || !( name in this.template.a ) ) node.removeAttribute( name );
			}
		}

		this.attributes.forEach( render );
		this.conditionalAttributes.forEach( render );

		if ( this.decorator ) runloop.scheduleTask( () => this.decorator.render(), true );
		if ( this.binding ) this.binding.render();

		this.eventHandlers.forEach( render );

		updateLiveQueries( this );

		// transitions
		const transitionTemplate = this.template.t0 || this.template.t1;
		if ( transitionTemplate && this.ractive.transitionsEnabled ) {
			const transition = new Transition( this, transitionTemplate, true );
			runloop.registerTransition( transition );

			this._introTransition = transition; // so we can abort if it gets removed
		}

		if ( !existing ) {
			target.appendChild( node );
		}

		this.rendered = true;
	}

	toString () {
		const tagName = this.template.e;

		let attrs = this.attributes.map( stringifyAttribute ).join( '' ) +
		            this.conditionalAttributes.map( stringifyAttribute ).join( '' );

		// Special case - selected options
		if ( this.name === 'option' && this.isSelected() ) {
			attrs += ' selected';
		}

		// Special case - two-way radio name bindings
		if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
			attrs += ' checked';
		}

		let str = `<${tagName}${attrs}>`;

		if ( this.isVoid ) return str;

		// Special case - textarea
		if ( this.name === 'textarea' && this.getAttribute( 'value' ) !== undefined ) {
			str += escapeHtml( this.getAttribute( 'value' ) );
		}

		// Special case - contenteditable
		else if ( this.getAttribute( 'contenteditable' ) !== undefined ) {
			str += ( this.getAttribute( 'value' ) || '' );
		}

		if ( this.fragment ) {
			str += this.fragment.toString( !/^(?:script|style)$/i.test( this.template.e ) ); // escape text unless script/style
		}

		str += `</${tagName}>`;
		return str;
	}

	unbind () {
		this.attributes.forEach( unbind );
		this.conditionalAttributes.forEach( unbind );

		if ( this.decorator ) this.decorator.unbind();
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( !this.rendered ) return;
		this.rendered = false;

		// unrendering before intro completed? complete it now
		// TODO should be an API for aborting transitions
		let transition = this._introTransition;
		if ( transition ) transition.complete();

		// Detach as soon as we can
		if ( this.name === 'option' ) {
			// <option> elements detach immediately, so that
			// their parent <select> element syncs correctly, and
			// since option elements can't have transitions anyway
			this.detach();
		} else if ( shouldDestroy ) {
			runloop.detachWhenReady( this );
		}

		if ( this.fragment ) this.fragment.unrender();

		this.eventHandlers.forEach( unrender );

		if ( this.binding ) this.binding.unrender();
		if ( !shouldDestroy && this.decorator ) this.decorator.unrender();

		// outro transition
		const transitionTemplate = this.template.t0 || this.template.t2;
		if ( transitionTemplate && this.ractive.transitionsEnabled ) {
			const transition = new Transition( this, transitionTemplate, false );
			runloop.registerTransition( transition );
		}

		// special case
		const id = this.attributeByName.id;
		if ( id  ) {
			delete this.ractive.nodes[ id.getValue() ];
		}

		removeFromLiveQueries( this );
		// TODO forms are a special case
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;

			this.attributes.forEach( update );
			this.conditionalAttributes.forEach( update );
			this.eventHandlers.forEach( update );

			if ( this.decorator ) this.decorator.update();
			if ( this.fragment ) this.fragment.update();
		}
	}
}

function inputIsCheckedRadio ( element ) {
	const attributes = element.attributeByName;

	const typeAttribute  = attributes.type;
	const valueAttribute = attributes.value;
	const nameAttribute  = attributes.name;

	if ( !typeAttribute || ( typeAttribute.value !== 'radio' ) || !valueAttribute || !nameAttribute.interpolator ) {
		return;
	}

	if ( valueAttribute.getValue() === nameAttribute.interpolator.model.get() ) {
		return true;
	}
}

function stringifyAttribute ( attribute ) {
	const str = attribute.toString();
	return str ? ' ' + str : '';
}

function removeFromLiveQueries ( element ) {
	let i = element.liveQueries.length;
	while ( i-- ) {
		const query = element.liveQueries[i];
		query.remove( element.node );
	}
}

function getNamespace ( element ) {
	// Use specified namespace...
	const xmlns = element.getAttribute( 'xmlns' );
	if ( xmlns ) return xmlns;

	// ...or SVG namespace, if this is an <svg> element
	if ( element.name === 'svg' ) return svg;

	const parent = element.parent;

	if ( parent ) {
		// ...or HTML, if the parent is a <foreignObject>
		if ( parent.name === 'foreignobject' ) return html;

		// ...or inherit from the parent node
		return parent.node.namespaceURI;
	}

	return element.ractive.el.namespaceURI;
}
