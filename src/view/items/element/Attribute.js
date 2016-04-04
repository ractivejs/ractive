import { INTERPOLATOR } from '../../../config/types';
import namespaces from '../../../config/namespaces';
import Fragment from '../../Fragment';
import Item from '../shared/Item';
import findElement from '../shared/findElement';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import propertyNames from './attribute/propertyNames';
import { isArray } from '../../../utils/is';
import { safeToStringValue } from '../../../utils/dom';
import { booleanAttributes } from '../../../utils/html';

function lookupNamespace ( node, prefix ) {
	const qualified = `xmlns:${prefix}`;

	while ( node ) {
		if ( node.hasAttribute( qualified ) ) return node.getAttribute( qualified );
		node = node.parentNode;
	}

	return namespaces[ prefix ];
}

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;
		this.namespace = null;

		this.owner = options.owner || options.parentFragment.owner || options.element || findElement( options.parentFragment );
		this.element = options.element || (this.owner.attributeByName ? this.owner : findElement( options.parentFragment ) );
		this.parentFragment = this.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.rendered = false;
		this.updateDelegate = null;
		this.fragment = null;

		this.element.attributeByName[ this.name ] = this;

		if ( !isArray( options.template.f ) ) {
			this.value = options.template.f;
			if ( this.value === 0 ) {
				this.value = '';
			}
		} else {
			this.fragment = new Fragment({
				owner: this,
				template: options.template.f
			});
		}

		this.interpolator = this.fragment &&
			this.fragment.items.length === 1 &&
			this.fragment.items[0].type === INTERPOLATOR &&
			this.fragment.items[0];
	}

	bind () {
		if ( this.fragment ) {
			this.fragment.bind();
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.element.bubble();
			this.dirty = true;
		}
	}

	getString () {
		return this.fragment ?
			this.fragment.toString() :
			this.value != null ? '' + this.value : '';
	}

	// TODO could getValue ever be called for a static attribute,
	// or can we assume that this.fragment exists?
	getValue () {
		return this.fragment ? this.fragment.valueOf() : booleanAttributes.test( this.name ) ? true : this.value;
	}

	rebind () {
		if ( this.fragment ) this.fragment.rebind();
	}

	render () {
		const node = this.element.node;
		this.node = node;

		// should we use direct property access, or setAttribute?
		if ( !node.namespaceURI || node.namespaceURI === namespaces.html ) {
			this.propertyName = propertyNames[ this.name ] || this.name;

			if ( node[ this.propertyName ] !== undefined ) {
				this.useProperty = true;
			}

			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( booleanAttributes.test( this.name ) || this.isTwoway ) {
				this.isBoolean = true;
			}

			if ( this.propertyName === 'value' ) {
				node._ractive.value = this.value;
			}
		}

		if ( node.namespaceURI ) {
			const index = this.name.indexOf( ':' );
			if ( index !== -1 ) {
				this.namespace = lookupNamespace( node, this.name.slice( 0, index ) );
			} else {
				this.namespace = node.namespaceURI;
			}
		}

		this.rendered = true;
		this.updateDelegate = getUpdateDelegate( this );
		this.updateDelegate();
	}

	toString () {
		const value = this.getValue();

		// Special case - select and textarea values (should not be stringified)
		if ( this.name === 'value' && ( this.element.getAttribute( 'contenteditable' ) !== undefined || ( this.element.name === 'select' || this.element.name === 'textarea' ) ) ) {
			return;
		}

		// Special case – bound radio `name` attributes
		if ( this.name === 'name' && this.element.name === 'input' && this.interpolator && this.element.getAttribute( 'type' ) === 'radio' ) {
			return `name="{{${this.interpolator.model.getKeypath()}}}"`;
		}

		if ( booleanAttributes.test( this.name ) ) return value ? this.name : '';
		if ( value == null ) return '';

		const str = safeToStringValue( this.getString() )
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );

		return str ?
			`${this.name}="${str}"` :
			this.name;
	}

	unbind () {
		if ( this.fragment ) this.fragment.unbind();
		if ( this.boundFragment ) this.boundFragment.unbind();
	}

	unrender () {
		this.updateDelegate( true );

		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.fragment ) this.fragment.update();
			if ( this.boundFragment ) this.boundFragment.update();
			if ( this.rendered ) this.updateDelegate();
		}
	}
}
