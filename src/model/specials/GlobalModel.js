import { top } from '../../config/environment';
import Model from '../Model';

class GlobalModel extends Model {
	constructor ( ) {
		super( null, '@global' );
		this.value = top;
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
