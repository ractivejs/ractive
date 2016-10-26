import { ATTRIBUTE, BINDING_FLAG, DECORATOR, EVENT, TRANSITION } from '../../config/types';
import runloop from '../../global/runloop';
import { ContainerItem } from './shared/Item';
import Fragment from '../Fragment';
import ConditionalAttribute from './element/ConditionalAttribute';
import updateLiveQueries from './element/updateLiveQueries';
import { removeFromArray, toArray } from '../../utils/array';
import { escapeHtml, voidElementNames } from '../../utils/html';
import { bind, render, unbind, update } from '../../shared/methodCallers';
import { createElement, detachNode, matches, safeAttributeString, decamelize } from '../../utils/dom';
import createItem from './createItem';
import { html, svg } from '../../config/namespaces';
import findElement from './shared/findElement';
import { defineProperty } from '../../utils/object';
import selectBinding from './element/binding/selectBinding';

function makeDirty ( query ) {
	query.makeDirty();
}

const endsWithSemi = /;\s*$/;

export default class Element extends ContainerItem {
	constructor ( options ) {
		super( options );

		this.liveQueries = []; // TODO rare case. can we handle differently?

		this.name = options.template.e.toLowerCase();
		this.isVoid = voidElementNames.test( this.name );

		// find parent element
		this.parent = findElement( this.parentFragment, false );

		if ( this.parent && this.parent.name === 'option' ) {
			throw new Error( `An <option> element cannot contain other elements (encountered <${this.name}>)` );
		}

		this.decorators = [];

		// create attributes
		this.attributeByName = {};

		this.attributes = [];
		const leftovers = [];
		( this.template.m || [] ).forEach( template => {
			switch ( template.t ) {
				case ATTRIBUTE:
				case BINDING_FLAG:
				case DECORATOR:
				case EVENT:
				case TRANSITION:
					this.attributes.push( createItem({
						owner: this,
						parentFragment: this.parentFragment,
						template
					}) );
					break;

				default:
					leftovers.push( template );
					break;
			}
		});

		if ( leftovers.length ) {
			this.attributes.push( new ConditionalAttribute({
				owner: this,
				parentFragment: this.parentFragment,
				template: leftovers
			}) );
		}

		let i = this.attributes.length;
		while ( i-- ) {
			let attr = this.attributes[ i ];
			if ( attr.name === 'type' ) this.attributes.unshift( this.attributes.splice( i, 1 )[ 0 ] );
			else if ( attr.name === 'max' ) this.attributes.unshift( this.attributes.splice( i, 1 )[ 0 ] );
			else if ( attr.name === 'min' ) this.attributes.unshift( this.attributes.splice( i, 1 )[ 0 ] );
			else if ( attr.name === 'class' ) this.attributes.unshift( this.attributes.splice( i, 1 )[ 0 ] );
			else if ( attr.name === 'value' ) {
				this.attributes.push( this.attributes.splice( i, 1 )[ 0 ] );
			}
		}

		// create children
		if ( options.template.f && !options.deferContent ) {
			this.fragment = new Fragment({
				template: options.template.f,
				owner: this,
				cssIds: null
			});
		}

		this.binding = null; // filled in later
	}

	bind () {
		this.attributes.binding = true;
		this.attributes.forEach( bind );
		this.attributes.binding = false;

		if ( this.fragment ) this.fragment.bind();

		// create two-way binding if necessary
		if ( !this.binding ) this.recreateTwowayBinding();
	}

	createTwowayBinding () {
		const shouldBind = 'twoway' in this ? this.twoway : this.ractive.twoway;

		if ( !shouldBind ) return null;

		const Binding = selectBinding( this );

		if ( !Binding ) return null;

		const binding = new Binding( this );

		return binding && binding.model ?
			binding :
			null;
	}

	destroyed () {
		this.attributes.forEach( a => a.destroyed() );
		if ( this.fragment ) this.fragment.destroyed();
	}

	detach () {
		// if this element is no longer rendered, the transitions are complete and the attributes can be torn down
		if ( !this.rendered ) this.destroyed();

		return detachNode( this.node );
	}

	find ( selector, options ) {
		if ( matches( this.node, selector ) ) return this.node;
		if ( this.fragment ) {
			return this.fragment.find( selector, options );
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

	recreateTwowayBinding () {
		if ( this.binding ) {
			this.binding.unbind();
			this.binding.unrender();
		}

		if ( this.binding = this.createTwowayBinding() ) {
			this.binding.bind();
			if ( this.rendered ) this.binding.render();
		}
	}

	removeFromQuery ( query ) {
		query.remove( this.node );
		removeFromArray( this.liveQueries, query );
	}

	render ( target, occupants ) {
		// TODO determine correct namespace
		this.namespace = getNamespace( this );

		let node;
		let existing = false;

		if ( occupants ) {
			let n;
			while ( ( n = occupants.shift() ) ) {
				if ( n.nodeName.toUpperCase() === this.template.e.toUpperCase() && n.namespaceURI === this.namespace ) {
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
				proxy: this
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
				if ( !( name in this.attributeByName ) ) node.removeAttribute( name );
			}
		}

		this.attributes.forEach( render );

		if ( this.binding ) this.binding.render();

		updateLiveQueries( this );

		if ( this._introTransition && this.ractive.transitionsEnabled ) {
			this._introTransition.isIntro = true;
			runloop.registerTransition( this._introTransition );
		}

		if ( !existing ) {
			target.appendChild( node );
		}

		this.rendered = true;
	}

	shuffled () {
		this.liveQueries.forEach( makeDirty );
		super.shuffled();
	}

	toString () {
		const tagName = this.template.e;

		let attrs = this.attributes.map( stringifyAttribute ).join( '' );

		// Special case - selected options
		if ( this.name === 'option' && this.isSelected() ) {
			attrs += ' selected';
		}

		// Special case - two-way radio name bindings
		if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
			attrs += ' checked';
		}

		// Special case style and class attributes and directives
		let style, cls;
		this.attributes.forEach( attr => {
			if ( attr.name === 'class' ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + safeAttributeString( attr.getString() );
			} else if ( attr.name === 'style' ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) + safeAttributeString( attr.getString() );
				if ( style && !endsWithSemi.test( style ) ) style += ';';
			} else if ( attr.styleName ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) +  `${decamelize( attr.styleName )}: ${safeAttributeString( attr.getString() )};`;
			} else if ( attr.inlineClass && attr.getValue() ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + attr.inlineClass;
			}
		});
		// put classes first, then inline style
		if ( style !== undefined ) attrs = ' style' + ( style ? `="${style}"` : '' ) + attrs;
		if ( cls !== undefined ) attrs = ' class' + (cls ? `="${cls}"` : '') + attrs;

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

		if ( this.binding ) this.binding.unbind();
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( !this.rendered ) return;
		this.rendered = false;

		// unrendering before intro completed? complete it now
		// TODO should be an API for aborting transitions
		let transition = this._introTransition;
		if ( transition && transition.complete ) transition.complete();

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

		if ( this.binding ) this.binding.unrender();

		// outro transition
		if ( this._outroTransition && this.ractive.transitionsEnabled ) {
			this._outroTransition.isIntro = false;
			runloop.registerTransition( this._outroTransition );
		}

		this.liveQueries.forEach( query => query.remove( this.node ) );
		this.liveQueries = [];
		// TODO forms are a special case
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;

			this.attributes.forEach( update );

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
