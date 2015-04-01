import Reference from './Reference';

class DynamicReference extends Reference {

	constructor ( key, reference ) {
		super( '[' + key + ']' );
		this.reference = reference;
		reference.register( {
			mark: () => this.reset()
		}, 'computed' );
	}

	getJoinKey () {
		return this.reference.get();
	}
}

export default DynamicReference;
