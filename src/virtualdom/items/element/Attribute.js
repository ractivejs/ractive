import { INTERPOLATOR } from 'config/types';
import Fragment from '../../Fragment';
import Item from '../shared/Item';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import { isArray } from 'utils/is';
import { safeToStringValue } from 'utils/dom';

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.name;
		this.element = options.element;
		this.parentFragment = options.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.updateDelegate = null;
		this.fragment = null;
		this.value = null;

		if ( !isArray( options.template ) ) {
			this.value = options.template;
			if ( this.value === 0 ) this.value = this.isEmpty = true;
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
		return this.fragment ? this.fragment.valueOf() : this.value;
	}

	render () {
		if ( this.isEmpty ) return;

		this.node = this.element.node;

		this.updateDelegate = getUpdateDelegate( this );
		this.updateDelegate();
	}

	toString () {
		if ( this.isEmpty ) return '';

		const value = safeToStringValue( this.getString() )
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );

		return value ?
			`${this.name}="${value}"` :
			this.name;
	}

	update () {
		if ( this.dirty ) {
			if ( this.fragment ) {
				this.fragment.update();
			}

			this.updateDelegate();
			this.dirty = false;
		}
	}
}
