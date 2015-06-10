export default class Mustache {
	constructor ( options ) {
		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.model = null;
	}

	bind () {
		// try to find a model for this view
		this.parentFragment.resolve( this.template, model => {
			this.model = model;
		});
	}

	unbind () {
		this.model && this.model.unregister( this );
	}
}
