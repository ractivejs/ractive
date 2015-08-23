import { INTERPOLATOR } from 'config/types';
import { html } from 'config/namespaces';
import Fragment from '../../Fragment';
import Item from '../shared/Item';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import propertyNames from './attribute/propertyNames';
import { isArray } from 'utils/is';
import { safeToStringValue } from 'utils/dom';
import { booleanAttributes } from 'utils/html';

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.name;
		this.element = options.element;
		this.parentFragment = options.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.rendered = false;
		this.updateDelegate = null;
		this.fragment = null;
		this.value = null;

		if ( !isArray( options.template ) ) {
			this.value = options.template;
			if ( this.value === 0 ) {
				this.value = '';
				this.isEmpty = true;
			}
		} else {
			this.fragment = new Fragment({
				owner: this,
				template: options.template
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
		return this.fragment ? this.fragment.valueOf() : this.isEmpty ? true : this.value;
	}

	rebind () {
		this.unbind();
		this.bind();
	}

	render () {
		const node = this.element.node;
		this.node = node;

		// should we use direct property access, or setAttribute?
		if ( !node.namespaceURI || node.namespaceURI === html ) {
			const propertyName = propertyNames[ this.name ] || this.name;

			if ( node[ propertyName ] !== undefined ) {
				this.propertyName = propertyName;
			}

			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( booleanAttributes.test( this.name ) || this.isTwoway ) {
				this.useProperty = true;
			}

			if ( propertyName === 'value' ) {
				node._ractive.value = this.value;
			}
		}

		this.rendered = true;
		this.updateDelegate = getUpdateDelegate( this );
		this.updateDelegate();
	}

	toString () {
		if ( this.isEmpty ) return '';
		if ( this.getValue() == null ) return '';

		// Special case - select and textarea values (should not be stringified)
		if ( this.name === 'value' && ( this.element.name === 'select' || this.element.name === 'textarea' ) ) {
			return;
		}

		const value = safeToStringValue( this.getString() )
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );

		return value ?
			`${this.name}="${value}"` :
			this.name;
	}

	unbind () {
		if ( this.fragment ) this.fragment.unbind();
	}

	update () {
		if ( this.dirty ) {
			if ( this.fragment ) this.fragment.update();
			if ( this.rendered ) this.updateDelegate();
			this.dirty = false;
		}
	}
}
