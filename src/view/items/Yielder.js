import Item from './shared/Item';
import Fragment from '../Fragment';
import parse from 'parse/_parse';
import { warnIfDebug } from 'utils/log';
import { removeFromArray } from 'utils/array';

export default class Yielder extends Item {
	constructor ( options ) {
		super( options );

		this.container = options.parentFragment.ractive;
		this.component = this.container.component;

		this.containerFragment = options.parentFragment;
		this.parentFragment = this.component.parentFragment;

		// {{yield}} is equivalent to {{yield content}}
		this.name = options.template.n || '';
	}

	bind () {
		const name = this.name;

		( this.component.yielders[ name ] || ( this.component.yielders[ name ] = [] ) ).push( this );

		// TODO find in hierarchy, don't parse here
		let template = this.container.partials[ name || 'content' ];

		if ( typeof template === 'string' ) {
			template = parse( template ).t;
		}

		if ( !template ) {
			warnIfDebug( `Could not find template for partial "${name}"`, { ractive: this.ractive });
			template = [];
		}

		this.fragment = new Fragment({
			owner: this,
			ractive: this.container.parent,
			template
		}).bind();
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

	rebind () {
		console.warn( 'TODO rebind yielder' );
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

	unbind () {
		this.fragment.unbind();
		removeFromArray( this.component.yielders[ this.name ], this );
	}

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	}
}
