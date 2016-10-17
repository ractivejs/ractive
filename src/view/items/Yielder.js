import { ContainerItem } from './shared/Item';
import Fragment from '../Fragment';
import parse from '../../parse/_parse';
import { warnIfDebug } from '../../utils/log';
import { removeFromArray } from '../../utils/array';
import { resolveAliases } from './Alias';

export default class Yielder extends ContainerItem {
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
		});
		if ( this.template.z ) {
			this.fragment.aliases = resolveAliases( this.template.z, this.containerFragment );
		}
		this.fragment.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.containerFragment.bubble();
			this.dirty = true;
		}
	}

	findNextNode() {
		return this.containerFragment.findNextNode( this );
	}

	rebinding () {
		if ( this.locked ) return;
		this.locked = true;
		runloop.scheduleTask( () => {
			this.locked = false;
			this.fragment.aliases = resolveAliases( this.template.z, this.containerFragment );
		});
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

	unbind () {
		this.fragment.aliases = {};
		this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	}

	update () {
		this.dirty = false;
		this.fragment.update();
	}
}
