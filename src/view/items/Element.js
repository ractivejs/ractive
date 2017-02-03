import { ATTRIBUTE, BINDING_FLAG, DECORATOR, DELEGATE_FLAG, EVENT, TRANSITION } from '../../config/types';
import runloop from '../../global/runloop';
import { ContainerItem } from './shared/Item';
import Fragment from '../Fragment';
import ConditionalAttribute from './element/ConditionalAttribute';
import { toArray } from '../../utils/array';
import { escapeHtml, voidElementNames } from '../../utils/html';
import { bind, destroyed, render, unbind, update } from '../../shared/methodCallers';
import { createElement, detachNode, matches, safeAttributeString } from '../../utils/dom';
import createItem from './createItem';
import { html, svg } from '../../config/namespaces';
import findElement from './shared/findElement';
import selectBinding from './element/binding/selectBinding';
import { DelegateProxy } from './shared/EventDirective';

const endsWithSemi = /;\s*$/;

export default class Element extends ContainerItem {
	constructor ( options ) {
		super( options );

		this.name = options.template.e.toLowerCase();
		this.isVoid = voidElementNames.test( this.name );

		// find parent element
		this.parent = findElement( this.parentFragment, false );

		if ( this.parent && this.parent.name === 'option' ) {
			throw new Error( `An <option> element cannot contain other elements (encountered <${this.name}>)` );
		}

		this.decorators = [];
		this.events = [];

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

				case DELEGATE_FLAG:
				  this.delegate = false;
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

		this.attributes.sort( sortAttributes );

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
		if ( 'twoway' in this ? this.twoway : this.ractive.twoway ) {
			const Binding = selectBinding( this );
			if ( Binding ) {
				const binding = new Binding( this );
				if ( binding && binding.model ) return binding;
			}
		}
	}

	destroyed () {
		this.attributes.forEach( destroyed );
		for ( const ev in this.delegates ) {
			this.delegates[ev].unlisten();
		}
		if ( this.fragment ) this.fragment.destroyed();
	}

	detach () {
		// if this element is no longer rendered, the transitions are complete and the attributes can be torn down
		if ( !this.rendered ) this.destroyed();

		return detachNode( this.node );
	}

	find ( selector, options ) {
		if ( this.node && matches( this.node, selector ) ) return this.node;
		if ( this.fragment ) {
			return this.fragment.find( selector, options );
		}
	}

	findAll ( selector, options ) {
		const { result } = options;

		if ( matches( this.node, selector ) ) {
			result.push( this.node );
		}

		if ( this.fragment ) {
			this.fragment.findAll( selector, options );
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
			const name = this.template.e;
			node = createElement( this.namespace === html ? name.toLowerCase() : name, this.namespace, this.getAttribute( 'is' ) );
			this.node = node;
		}

		// tie the node to this vdom element
		Object.defineProperty( node, '_ractive', {
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

		// register intro before rendering content so children can find the intro
		const intro = this.intro;
		if ( intro && intro.shouldFire( 'intro' ) ) {
			intro.isIntro = true;
			intro.isOutro = false;
			runloop.registerTransition( intro );
		}

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
				if ( !( name in this.attributeByName ) )node.removeAttribute( name );
			}
		}

		this.attributes.forEach( render );
		if ( this.delegates ) {
			for ( const ev in this.delegates ) {
				this.delegates[ev].listen( DelegateProxy );
			}
		}

		if ( this.binding ) this.binding.render();

		if ( !existing ) {
			target.appendChild( node );
		}

		this.rendered = true;
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
			} else if ( attr.style ) {
				style = ( style || '' ) + ( style ? ' ' : '' ) +  `${attr.style}: ${safeAttributeString( attr.getString() )};`;
			} else if ( attr.inlineClass && attr.getValue() ) {
				cls = ( cls || '' ) + ( cls ? ' ' : '' ) + attr.inlineClass;
			}
		});
		// put classes first, then inline style
		if ( style !== undefined ) attrs = ' style' + ( style ? `="${style}"` : '' ) + attrs;
		if ( cls !== undefined ) attrs = ' class' + (cls ? `="${cls}"` : '') + attrs;

		if ( this.parentFragment.cssIds ) {
			attrs += ` data-ractive-css="${this.parentFragment.cssIds.map( x => `{${x}}` ).join( ' ' )}"`;
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
		this.attributes.unbinding = true;
		this.attributes.forEach( unbind );
		this.attributes.unbinding = false;

		if ( this.binding ) this.binding.unbind();
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( !this.rendered ) return;
		this.rendered = false;

		// unrendering before intro completed? complete it now
		// TODO should be an API for aborting transitions
		const transition = this.intro;
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

		// outro transition
		const outro = this.outro;
		if ( outro && outro.shouldFire( 'outro' ) ) {
			outro.isIntro = false;
			outro.isOutro = true;
			runloop.registerTransition( outro );
		}

		if ( this.fragment ) this.fragment.unrender();

		if ( this.binding ) this.binding.unrender();
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;

			this.attributes.forEach( update );

			if ( this.fragment ) this.fragment.update();
		}
	}
}

const toFront = [ 'min', 'max', 'class', 'type' ];
function sortAttributes ( left, right ) {
	left = left.name;
	right = right.name;
	const l = left === 'value' ? 1 : ~toFront.indexOf( left );
	const r = right === 'value' ? 1 : ~toFront.indexOf( right );
	return l < r ? -1 : l > r ? 1 : 0;
}

function inputIsCheckedRadio ( element ) {
	const nameAttr = element.attributeByName.name;
	return element.getAttribute( 'type' ) === 'radio' &&
		( nameAttr || {} ).interpolator &&
		element.getAttribute( 'value' ) === nameAttr.interpolator.model.get();
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
