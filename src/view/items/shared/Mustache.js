import Item from './Item';
import resolve from '../../resolvers/resolve';

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

	rebind () {
		if ( this.isStatic ) return;

		const model = resolve( this.parentFragment, this.template );

		if ( model === this.model ) return;

		if ( this.model ) this.model.unregister( this );

		this.model = model;

		if ( model ) model.register( this );

		this.handleChange();
	}

	unbind () {
		if ( !this.isStatic ) {
			this.model && this.model.unregister( this );
			this.model = undefined;
			this.resolver && this.resolver.unbind();
		}
	}
}
