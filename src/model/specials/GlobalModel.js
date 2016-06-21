/* global global */
import Model from '../Model';

class GlobalModel extends Model {
	constructor ( ) {
		super( null, '@global' );
		this.value = typeof global !== 'undefined' ? global : window;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
	}

	getKeypath() {
		return '@global';
	}

	// global model doesn't contribute changes events because it has no instance
	registerChange () {}

	// the global model doesn't shuffle
	tryRebind () {
		return false;
	}
}

export default new GlobalModel();
