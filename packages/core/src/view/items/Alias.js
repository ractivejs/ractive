import Fragment from '../Fragment';
import { ContainerItem } from './shared/Item';
import resolve from '../resolvers/resolve';

export function resolveAliases( aliases, fragment ) {
	const resolved = {};

	for ( let i = 0; i < aliases.length; i++ ) {
		resolved[ aliases[i].n ] = resolve( fragment, aliases[i].x );
	}

	for ( const k in resolved ) {
		resolved[k].reference();
	}

	return resolved;
}

export default class Alias extends ContainerItem {
	constructor ( options ) {
		super( options );

		this.fragment = null;
	}

	bind () {
		this.fragment = new Fragment({
			owner: this,
			template: this.template.f
		});

		this.fragment.aliases = resolveAliases( this.template.z, this.parentFragment );
		this.fragment.bind();
	}

	render ( target ) {
		this.rendered = true;
		if ( this.fragment ) this.fragment.render( target );
	}

	unbind () {
		for ( const k in this.fragment.aliases ) {
			this.fragment.aliases[k].unreference();
		}

		this.fragment.aliases = {};
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			this.fragment.update();
		}
	}
}
