import Item from './Item';

export default class Mustache extends Item {
	constructor ( options ) {
		super( options );

		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.model = null;
		this.dirty = false;
	}

	bind () {
		// try to find a model for this view
		this.resolver = this.parentFragment.resolve( this.template, model => {
			const wasBound = !!this.model;

			if ( model === this.model ) {
				throw new Error( 'Resolved to the same model' ); // TODO invite issue
			}

			if ( this.model ) {
				this.model.unregister( this );
			}

			this.model = model;
			model.register( this );

			if ( wasBound ) this.handleChange();
		});
	}

	handleChange () {
		this.bubble();
	}

	unbind () {
		this.model && this.model.unregister( this );
		this.bound = false;
	}
}
