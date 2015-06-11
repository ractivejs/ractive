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

	toString () {
		return this.fragment.toString();
	}
}
