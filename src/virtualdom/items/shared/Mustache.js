import Item from './Item';
import resolve from '../../resolvers/resolve';

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
		let model = resolve( this.parentFragment, this.template );

		if ( model ) {
			this.model = model;
			model.register( this );
		}

		else {
			// TODO this can now only resolve once...
			this.resolver = this.parentFragment.resolve( this.template, model => {
				const wasBound = !!this.model;

				if ( model === this.model ) {
					this.handleChange();
					return;
				}

				if ( this.model ) {
					this.model.unregister( this );
				}

				this.model = model;
				model.register( this );

				if ( wasBound ) this.handleChange();
			});
		}
	}

	handleChange () {
		this.bubble();
	}

	unbind () {
		this.model && this.model.unregister( this );
		this.bound = false;
	}
}
