import { findInViewHierarchy } from 'shared/registry';
import { missingPlugin } from 'config/errors';
import Fragment from '../../Fragment';
import noop from 'utils/noop';

const missingDecorator = {
	update: noop,
	teardown: noop
};

export default class Decorator {
	constructor ( owner, template ) {
		this.owner = owner;
		this.template = template;

		this.parentFragment = owner.parentFragment;
		this.ractive = owner.ractive;

		this.dynamicName = typeof template.n === 'object';
		this.dynamicArgs = !!template.d;

		if ( this.dynamicName ) {
			this.nameFragment = new Fragment({
				owner: this,
				template: template.n
			});
		} else {
			this.name = template.n || template;
		}

		if ( this.dynamicArgs ) {
			this.argsFragment = new Fragment({
				owner: this,
				template: template.d
			});
		} else {
			this.args = template.a ? [ template.a ] : [];
		}

		this.node = null;
		this.intermediary = null;
	}

	bind () {
		if ( this.dynamicName ) {
			this.nameFragment.bind();
			this.name = this.nameFragment.toString();
		}

		if ( this.dynamicArgs ) this.argsFragment.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	rebind () {
		if ( this.dynamicName ) this.nameFragment.rebind();
		if ( this.dynamicArgs ) this.argsFragment.rebind();
	}

	render () {
		const fn = findInViewHierarchy( 'decorators', this.ractive, this.name );

		if ( !fn ) {
			missingPlugin( this.name, 'decorators' );
			this.intermediary = missingDecorator;
			return;
		}

		this.node = this.owner.node;

		const args = this.dynamicArgs ? this.argsFragment.getArgsList() : this.args;
		this.intermediary = fn.apply( this.ractive, [ this.node ].concat( args ) );

		if ( !this.intermediary || !this.intermediary.teardown ) {
			throw new Error( `The '${this.name}' decorator must return an object with a teardown method` );
		}
	}

	unbind () {
		if ( this.dynamicName ) this.nameFragment.unbind();
		if ( this.dynamicArgs ) this.argsFragment.unbind();
	}

	unrender () {
		this.intermediary.teardown();
	}

	update () {
		if ( this.dynamicName ) {
			const name = this.nameFragment.toString();

			if ( name !== this.name ) {
				this.name = name;
				this.unrender();
				this.render();
			}
		}

		else if ( this.intermediary.update ) {
			const args = this.dynamicArgs ? this.argsFragment.getArgsList() : this.args;
			this.intermediary.update.apply( this.ractive, args );
		}

		else {
			this.unrender();
			this.render();
		}
	}
}
