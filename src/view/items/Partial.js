import { warnOnceIfDebug } from 'utils/log';
import Mustache from './shared/Mustache';
import Fragment from '../Fragment';
import parse from 'parse/_parse';
import getPartialTemplate from './partial/getPartialTemplate';

export default class Partial extends Mustache {
	bind () {
		super.bind();

		if ( ( !this.model || typeof this.model.value !== 'string' ) && this.template.r ) {
			this.setTemplate( this.template.r );
		} else {
			this.setTemplate( this.model.value );
		}

		this.fragment = new Fragment({
			owner: this,
			template: this.partialTemplate
		}).bind();
	}

	detach () {
		return this.fragment.detach();
	}

	find ( selector ) {
		return this.fragment.find( selector );
	}

	findAll ( selector, query ) {
		this.fragment.find( selector, query );
	}

	findComponent ( name ) {
		return this.fragment.findComponent( name );
	}

	findAllComponents ( name, query ) {
		this.fragment.findAllComponents( name, query );
	}

	firstNode () {
		return this.fragment.firstNode();
	}

	forceResetTemplate () {
		this.partialTemplate = getPartialTemplate( this.ractive, this.name, this.parentFragment );

		if ( !this.partialTemplate ) {
			warnOnceIfDebug( `Could not find template for partial '${this.name}'` );
			this.partialTemplate = [];
		}

		this.fragment.resetTemplate( this.partialTemplate );
		this.bubble();
	}

	rebind () {
		console.warn( 'TODO rebind partial' );
	}

	render ( target ) {
		this.fragment.render( target );
	}

	setTemplate ( name ) {
		this.name = name;
		const template = getPartialTemplate( this.ractive, name, this.parentFragment );

		if ( !template ) {
			warnOnceIfDebug( `Could not find template for partial '${name}'` );
		}

		this.partialTemplate = template || [];
	}

	toString ( escape ) {
		return this.fragment.toString( escape );
	}

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	}

	update () {
		if ( this.dirty ) {
			if ( this.model && typeof this.model.value === 'string' && this.model.value !== this.name ) {
				this.setTemplate( this.model.value );
				this.fragment.resetTemplate( this.partialTemplate );
			}

			this.fragment.update();
			this.dirty = false;
		}
	}
}
