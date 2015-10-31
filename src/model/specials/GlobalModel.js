/* global global */
import Model from '../Model';

class GlobalModel extends Model {
	constructor ( ) {
		super( null, '@global' );
		this.value = typeof global !== 'undefined' ? global : window;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
		this.changes = {};
	}
}

export default new GlobalModel();
