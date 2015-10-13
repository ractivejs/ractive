import { findInViewHierarchy } from '../../../shared/registry';
import { missingPlugin } from '../../../config/errors';
import Fragment from '../../Fragment';
import noop from '../../../utils/noop';

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
			this.args = template.a || [];
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
		if ( !this.dirty ) return;

		let nameChanged = false;

		if ( this.dynamicName && this.nameFragment.dirty ) {
			const name = this.nameFragment.toString();

			nameChanged = name !== this.name;

			if ( nameChanged ) {
				this.name = name;
				this.unrender();
				this.render();
			}
		}

		if ( !nameChanged ) {
			if ( this.intermediary.update ) {
				if ( this.dynamicArgs ) {
					if ( this.argsFragment.dirty ) {
						const args = this.argsFragment.getArgsList();
						this.intermediary.update.apply( this.ractive, args );
					}
				}
				else {
					this.intermediary.update.apply( this.ractive, this.args );
				}
			}

			else {
				this.unrender();
				this.render();
			}
		}

		// need to run these for unrender/render cases
		// so can't just be in conditional if above
		if ( this.dynamicName && this.nameFragment.dirty ) {
			this.nameFragment.update();
		}

		if ( this.dynamicArgs && this.argsFragment.dirty ) {
			this.argsFragment.update();
		}

		this.dirty = false;
	}
}
