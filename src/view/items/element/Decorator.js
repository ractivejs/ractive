import { findInViewHierarchy } from '../../../shared/registry';
import findElement from '../shared/findElement';
import { warnOnce } from '../../../utils/log';
import { missingPlugin } from '../../../config/errors';
import Fragment from '../../Fragment';
import noop from '../../../utils/noop';
import runloop from '../../../global/runloop';
import { removeFromArray } from '../../../utils/array';
import { rebindMatch } from '../../../shared/rebind';
import { setupArgsFn, teardownArgsFn } from '../shared/directiveArgs';

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

		this.name = template.n;
		this.args = [];

		this.node = null;
		this.intermediary = null;

		this.element.decorators.push( this );
	}

	bind () {
		setupArgsFn( this, this.template, this.parentFragment );
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	destroyed () {
		if ( this.intermediary ) this.intermediary.teardown();
	}

	handleChange () { this.bubble(); }

	rebinding ( next, previous, safe ) {
		const idx = this.models.indexOf( previous );
		if ( !~idx ) return;

		next = rebindMatch( this.template.f.r[ idx ], next, previous );
		if ( next === previous ) return;

		previous.unregister( this );
		this.models.splice( idx, 1, next );
		if ( next ) next.addShuffleRegister( this, 'mark' );

		if ( !safe ) this.bubble();
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
			if ( this.fn ) {
				args = this.models.map( model => {
					if ( !model ) return undefined;

					return model.get();
				});
				args = this.fn.apply( this.ractive, args );
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
		teardownArgsFn( this, this.template );
	}

	unrender ( shouldDestroy ) {
		if ( ( !shouldDestroy || this.element.rendered ) && this.intermediary ) this.intermediary.teardown();
		this.rendered = false;
	}

	update () {
		if ( !this.dirty ) return;

		this.dirty = false;

		if ( this.intermediary ) {
			if ( !this.intermediary.update ) {
				this.unrender();
				this.render();
			}
			else {
				if ( this.fn ) {
					const args = this.models.map( model => {
						if ( !model ) return undefined;

						return model.get();
					});
					this.intermediary.update.apply( this.ractive, this.fn.apply( this.ractive, args ) );
				}
				else {
					this.intermediary.update.apply( this.ractive, this.args );
				}
			}
		}
	}
}
