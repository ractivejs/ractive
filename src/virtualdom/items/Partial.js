import Mustache from './shared/Mustache';
import Fragment from '../Fragment';
import parse from 'parse/_parse';

export default class Partial extends Mustache {
	constructor ( options ) {
		super( options );
	}

	bind () {
		super.bind();

		if ( ( !this.model || !this.model.value ) && this.template.r ) {
			this.setTemplate( this.template.r );
		} else {
			this.setTemplate( this.model.value );
		}

		this.fragment = new Fragment({
			owner: this,
			template: this.partialTemplate
		});

		this.fragment.bind();
	}

	detach () {
		return this.fragment.detach();
	}

	find ( selector ) {
		return this.fragment.find( selector );
	}

	findAll ( selector, queryResult ) {
		this.fragment.find( selector, queryResult );
	}

	findComponent ( name ) {
		return this.fragment.findComponent( name );
	}

	findAllComponents ( name, queryResult ) {
		this.fragment.findAllComponents( name, queryResult );
	}

	firstNode () {
		return this.fragment.firstNode();
	}

	render () {
		return this.fragment.render();
	}

	setTemplate ( name ) {
		let template = this.parentFragment.ractive.partials[ name ];

		if ( typeof template === 'string' ) {
			template = parse( template ).t;
		}

		this.partialTemplate = template || []; // TODO warn on missing partial
	}

	toString ( escape ) {
		return this.fragment.toString( escape );
	}

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	}
}
