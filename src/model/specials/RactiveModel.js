import Model from '../Model';

export default class RactiveModel extends Model {
	constructor ( ractive ) {
		super( null, '' );
		this.value = ractive;
		// removed because state keypaths need to include @ractive
		// are there other sideeffects?
		// this.isRoot = true;
		this.root = this;
		this.adaptors = [];
		this.ractive = ractive;
		this.changes = {};
	}

	getKeypath() {
		return '@ractive';
	}
}
