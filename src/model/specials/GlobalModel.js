/* global global */
import Model from '../Model';

class GlobalModel extends Model {
	constructor ( ) {
		super( null, '@global' );
		this.value = typeof global !== 'undefined' ? global : win;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
		this.changes = {};
	}

	getKeypath() {
		return '@global';
	}
}

export default new GlobalModel();
