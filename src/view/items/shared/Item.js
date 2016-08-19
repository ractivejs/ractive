export default class Item {
	constructor ( options ) {
		this.parentFragment = options.parentFragment;
		this.ractive = options.parentFragment.ractive;

		this.template = options.template;
		this.index = options.index;
		this.type = options.template.t;

		this.dirty = false;
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	destroyed () {}

	find () {
		return null;
	}

	findAll () {
		// noop
	}

	findComponent () {
		return null;
	}

	findAllComponents () {
		// noop;
	}

	findNextNode () {
		return this.parentFragment.findNextNode( this );
	}

	shuffled () {
		if ( this.fragment ) this.fragment.shuffled();
	}

	valueOf () {
		return this.toString();
	}
}
