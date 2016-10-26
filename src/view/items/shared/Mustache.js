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
		// try to find a model for this view
		const model = resolve( this.parentFragment, this.template );
		const value = model ? model.get() : undefined;

		if ( this.isStatic ) {
			this.model = { get: () => value };
			return;
		}

		if ( model ) {
			model.register( this );
			this.model = model;
		} else {
			this.resolver = this.parentFragment.resolve( this.template.r, model => {
				this.model = model;
				model.register( this );

				this.handleChange();
				this.resolver = null;
			});
		}
	}

	handleChange () {
		this.bubble();
	}

	rebinding ( next, previous, safe ) {
		next = rebindMatch( this.template, next, previous );
		if ( this.static ) return false;
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
			this.resolver && this.resolver.unbind();
		}
	}
}

export class MustacheContainer extends ContainerItem {
	constructor ( options ) {
		super( options );
	}
};
const proto = MustacheContainer.prototype;
const mustache = Mustache.prototype;
proto.bind = mustache.bind;
proto.handleChange = mustache.handleChange;
proto.rebinding = mustache.rebinding;
proto.unbind = mustache.unbind;
