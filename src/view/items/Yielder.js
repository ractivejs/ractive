import Item from './shared/Item';
import Fragment from '../Fragment';
import parse from '../../parse/_parse';
import { warnIfDebug } from '../../utils/log';
import { removeFromArray } from '../../utils/array';

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

		// TODO don't parse here
		let template = this.container._inlinePartials[ name || 'content' ];

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

	bubble () {
		if ( !this.dirty ) {
			this.containerFragment.bubble();
			this.dirty = true;
		}
	}

	detach () {
		return this.fragment.detach();
	}

	find ( selector, options ) {
		return this.fragment.find( selector, options );
	}

	findAll ( selector, queryResult ) {
		this.fragment.find( selector, queryResult );
	}

	findComponent ( name, options ) {
		return this.fragment.findComponent( name, options );
	}

	findAllComponents ( name, queryResult ) {
		this.fragment.findAllComponents( name, queryResult );
	}

	findNextNode() {
		return this.containerFragment.findNextNode( this );
	}

	firstNode ( skipParent ) {
		return this.fragment.firstNode( skipParent );
	}

	rebind () {
		this.fragment.rebind();
	}

	render ( target, occupants ) {
		return this.fragment.render( target, occupants );
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

	update () {
		this.dirty = false;
		this.fragment.update();
	}
}
