import Item from './Item';

export default class Mustache extends Item {
	constructor ( options ) {
		super( options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.model = null;
		this.bound = false;
		this.dirty = false;
	}

	bind () {
		// try to find a model for this view
		this.parentFragment.resolve( this.template, model => {
			if ( model === this.model ) {
				throw new Error( 'yes, it happens. remove this check' );
			}

			if ( this.model ) {
				this.model.unregister( this );
			}

			this.model = model;
			model.register( this );

			if ( this.bound ) this.handleChange();
		});

		this.bound = true;
	}

	handleChange () {
		this.bubble();
	}

	unbind () {
		this.model && this.model.unregister( this );
		this.bound = false;
	}
}
