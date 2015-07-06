import Item from './Item';
import resolve from '../../resolvers/resolve';

export default class Mustache extends Item {
	constructor ( options ) {
		super( options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.isStatic = !!options.template.s;

		this.model = null;
		this.dirty = false;
	}

	bind () {
		// try to find a model for this view
		const model = resolve( this.parentFragment, this.template );

		if ( this.isStatic ) {
			this.model = { value: model.value };
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
		if ( this.isStatic || !this.model ) return;

		const model = resolve( this.parentFragment, this.template );

		if ( model === this.model ) return;

		const oldValue = this.model.value;
		this.model.unregister( this );

		model.register( this );
		this.model = model;

		if ( model.value !== oldValue ) this.handleChange();
	}

	unbind () {
		if ( !this.isStatic ) {
			this.model && this.model.unregister( this );
			this.resolver && this.resolver.unbind();
		}
	}
}
