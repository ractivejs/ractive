import Model from '../Model';

const data = {};

class SharedModel extends Model {
	constructor ( ) {
		super( null, '@shared' );
		this.value = data;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
	}

	getKeypath() {
		return '@shared';
	}

	// shared model doesn't contribute changes events because it has no instance
	registerChange () {}
}

export default new SharedModel();
