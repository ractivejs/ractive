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
}

export default new GlobalModel();
