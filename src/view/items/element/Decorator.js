import { findInViewHierarchy } from '../../../shared/registry';
import findElement from '../shared/findElement';
import { warnOnce } from '../../../utils/log';
import { missingPlugin } from '../../../config/errors';
import { unbind } from '../../../shared/methodCallers';
import Fragment from '../../Fragment';
import noop from '../../../utils/noop';
import runloop from '../../../global/runloop';
import { removeFromArray } from '../../../utils/array';
import getFunction from '../../../shared/getFunction';
import resolveReference from '../../resolvers/resolveReference';

const missingDecorator = {
	update: noop,
	teardown: noop
};

export default class Decorator {
	constructor ( options ) {
		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.parentFragment = this.owner.parentFragment;
		this.ractive = this.owner.ractive;
		let template = this.template = options.template;

		this.dynamicName = typeof template.f.n === 'object';
		this.dynamicArgs = !!template.f.d;

		if ( this.dynamicName ) {
			this.nameFragment = new Fragment({
				owner: this,
				template: template.f.n
			});
		} else {
			this.name = template.f.n || template.f;
		}

		if ( this.dynamicArgs ) {
			this.argsFragment = new Fragment({
				owner: this,
				template: template.f.d
			});
		} else {
			if ( template.f.a && template.f.a.s ) {
				this.args = [];
			} else {
				this.args = template.f.a || [];
			}
		}

		this.node = null;
		this.intermediary = null;

		this.element.decorators.push( this );
	}

	bind () {
		if ( this.dynamicName ) {
			this.nameFragment.bind();
			this.name = this.nameFragment.toString();
		}

		if ( this.dynamicArgs ) this.argsFragment.bind();

		// TODO: dry this up once deprecation is done
		if ( this.template.f.a && this.template.f.a.s ) {
			this.resolvers = [];
			this.models = this.template.f.a.r.map( ( ref, i ) => {
				let resolver;
				const model = resolveReference( this.parentFragment, ref );
				if ( !model ) {
					resolver = this.parentFragment.resolve( ref, model => {
						this.models[i] = model;
						removeFromArray( this.resolvers, resolver );
					});

					this.resolvers.push( resolver );
				}

				return model;
			});
			this.argsFn = getFunction( this.template.f.a.s, this.template.f.a.r.length );
		}
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
		if ( this.argsFn ) {
			this.unbind();
			this.bind();
			if ( this.rendered ) this.update();
		}
	}

	render () {
		runloop.scheduleTask( () => {
			const fn = findInViewHierarchy( 'decorators', this.ractive, this.name );

			if ( !fn ) {
				warnOnce( missingPlugin( this.name, 'decorator' ) );
				this.intermediary = missingDecorator;
				return;
			}

			this.node = this.element.node;

			let args;
			if ( this.argsFn ) {
				args = this.models.map( model => {
					if ( !model ) return undefined;

					return model.get();
				});
				args = this.argsFn.apply( this.ractive, args );
			} else {
				args = this.dynamicArgs ? this.argsFragment.getArgsList() : this.args;
			}

			this.intermediary = fn.apply( this.ractive, [ this.node ].concat( args ) );

			if ( !this.intermediary || !this.intermediary.teardown ) {
				throw new Error( `The '${this.name}' decorator must return an object with a teardown method` );
			}
		}, true );
		this.rendered = true;
	}

	toString () { return ''; }

	unbind () {
		if ( this.dynamicName ) this.nameFragment.unbind();
		if ( this.dynamicArgs ) this.argsFragment.unbind();
		if ( this.resolvers ) this.resolvers.forEach( unbind );
	}

	unrender ( shouldDestroy ) {
		if ( ( !shouldDestroy || this.element.rendered ) && this.intermediary ) this.intermediary.teardown();
		this.rendered = false;
	}

	update () {
		if ( !this.dirty ) return;

		this.dirty = false;

		let nameChanged = false;

		if ( this.dynamicName && this.nameFragment.dirty ) {
			const name = this.nameFragment.toString();
			nameChanged = name !== this.name;
			this.name = name;
		}

		if ( this.intermediary ) {
			if ( nameChanged || !this.intermediary.update ) {
				this.unrender();
				this.render();
			}
			else {
				if ( this.dynamicArgs ) {
					if ( this.argsFragment.dirty ) {
						const args = this.argsFragment.getArgsList();
						this.intermediary.update.apply( this.ractive, args );
					}
				}
				else if ( this.argsFn ) {
					const args = this.models.map( model => {
						if ( !model ) return undefined;

						return model.get();
					});
					this.intermediary.update.apply( this.ractive, this.argsFn.apply( this.ractive, args ) );
				}
				else {
					this.intermediary.update.apply( this.ractive, this.args );
				}
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
	}
}
