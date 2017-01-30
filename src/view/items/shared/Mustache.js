import Item, { ContainerItem } from './Item';
import resolve from '../../resolvers/resolve';
import { rebindMatch } from '../../../shared/rebind';

export default class Mustache extends Item {
	constructor ( options ) {
		super( options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;
		if ( options.owner ) this.parent = options.owner;

		this.isStatic = !!options.template.s;

		this.model = null;
		this.dirty = false;
	}

	bind () {
		// yield mustaches should resolve in container context
		const start = this.containerFragment || this.parentFragment;
		// try to find a model for this view
		const model = resolve( start, this.template );

		if ( model ) {
			const value = model.get();

			if ( this.isStatic ) {
				this.model = { get: () => value };
				return;
			}

			model.register( this );
			this.model = model;
		}
	}

	handleChange () {
		this.bubble();
	}

	rebind ( next, previous, safe ) {
		next = rebindMatch( this.template, next, previous, this.parentFragment );
		if ( next === this.model ) return false;

		if ( this.model ) {
			this.model.unregister( this );
		}
		if ( next ) next.addShuffleRegister( this, 'mark' );
		this.model = next;
		if ( !safe ) this.handleChange();
		return true;
	}

	unbind () {
		if ( !this.isStatic ) {
			this.model && this.model.unregister( this );
			this.model = undefined;
		}
	}
}

export class MustacheContainer extends ContainerItem {
	constructor ( options ) {
		super( options );
	}
}
const proto = MustacheContainer.prototype;
const mustache = Mustache.prototype;
proto.bind = mustache.bind;
proto.handleChange = mustache.handleChange;
proto.rebind = mustache.rebind;
proto.unbind = mustache.unbind;
