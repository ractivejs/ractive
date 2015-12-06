import { INTERPOLATOR } from '../../../config/types';
import { html } from '../../../config/namespaces';
import Fragment from '../../Fragment';
import Item from '../shared/Item';
import determineNameAndNamespace from './attribute/determineNameAndNamespace';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import propertyNames from './attribute/propertyNames';
import { isArray } from '../../../utils/is';
import { safeToStringValue } from '../../../utils/dom';
import { booleanAttributes } from '../../../utils/html';

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.element = options.element;
		this.parentFragment = options.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		determineNameAndNamespace( this, options.name );

		this.rendered = false;
		this.updateDelegate = null;
		this.fragment = null;
		this.value = null;

		if ( !isArray( options.template ) ) {
			this.value = options.template;
			if ( this.value === 0 ) {
				this.value = '';
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
		return this.fragment ? this.fragment.valueOf() : booleanAttributes.test( this.name ) ? true : this.value;
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
	}

	update () {
		if ( this.dirty ) {
			if ( this.fragment ) this.fragment.update();
			if ( this.rendered ) this.updateDelegate();
			this.dirty = false;
		}
	}
}
