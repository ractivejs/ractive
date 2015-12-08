import { createDocumentFragment } from '../../utils/dom';
import Fragment from '../Fragment';
import Item from './shared/Item';
import resolve from '../resolvers/resolve';

function resolveAliases( section ) {
	if ( section.template.z ) {
		section.aliases = {};

		let refs = section.template.z;
		for ( let i = 0; i < refs.length; i++ ) {
			section.aliases[ refs[i].n ] = resolve( section.parentFragment, refs[i].x );
		}
	}
}

export default class Alias extends Item {
	constructor ( options ) {
		super( options );

		this.fragment = null;
	}

	bind () {
		resolveAliases( this );

		this.fragment = new Fragment({
			owner: this,
			template: this.template.f
		}).bind();
	}

	detach () {
		return this.fragment ? this.fragment.detach() : createDocumentFragment();
	}

	find ( selector ) {
		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	}

	findAll ( selector, query ) {
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

	firstNode () {
		return this.fragment && this.fragment.firstNode();
	}

	rebind () {
		resolveAliases( this );
		if ( this.fragment ) this.fragment.rebind();
	}

	render ( target ) {
		this.rendered = true;
		if ( this.fragment ) this.fragment.render( target );
	}

	toString ( escape ) {
		return this.fragment ? this.fragment.toString( escape ) : '';
	}

	unbind () {
		this.aliases = {};
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	}

	update () {
		if ( !this.dirty ) return;

		this.fragment.update();

		this.dirty = false;
	}
}
