export default class Item {
	constructor ( options ) {
		this.type = options.template.t;
		this.index = options.index;
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}
}
