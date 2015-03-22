import StaticReferenceModel from './StaticReferenceModel';

class ReferenceModel extends StaticReferenceModel {

	constructor ( key, reference, parent ) {
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

export default ReferenceModel;
