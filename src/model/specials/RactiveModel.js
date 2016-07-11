import Model from '../Model';

export default class RactiveModel extends Model {
	constructor ( ractive ) {
		super( null, '' );
		this.value = ractive;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
		this.ractive = ractive;
		this.changes = {};
	}

	getKeypath() {
		return '@this';
	}
}
