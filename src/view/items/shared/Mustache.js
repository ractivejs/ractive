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
		const value = model ? model.get() : undefined;

		if ( this.isStatic ) {
			this.model = { get: () => value };
			return;
		}

		if ( model ) {
			model.register( this );
			this.model = model;
		} else {
			this.resolver = start.resolve( this.template.r, model => {
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

	rebind ( next, previous, safe ) {
		next = rebindMatch( this.template, next, previous, this.parentFragment );
		if ( this.static ) return false;
		if ( next === this.model ) return false;

		if ( this.model ) {
			this.model.unregister( this );
		}
		if ( next ) next.addShuffleRegister( this, 'mark' );
		this.model = next;
		if ( !safe ) this.handleChange();
		if ( this.rebinding ) this.rebinding();
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

	rebinding () {
		if ( this.fragment ) this.fragment.rebinding( this.model );
	}
}
const proto = MustacheContainer.prototype;
const mustache = Mustache.prototype;
proto.bind = mustache.bind;
proto.handleChange = mustache.handleChange;
proto.rebind = mustache.rebind;
proto.unbind = mustache.unbind;
