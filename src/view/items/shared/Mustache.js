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
			this.model = model;

			if ( !this.template.s ) {
				model.register( this );
			}
		} else if ( !this.template.s ) {
			// TODO this can now only resolve once...
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
		this.unbind();
		this.bind();
	}

	unbind () {
		if ( !this.isStatic ) {
			this.model && this.model.unregister( this );
			this.resolver && this.resolver.unbind();
		}
	}
}
