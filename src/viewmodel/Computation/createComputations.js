import getComputationSignature from 'viewmodel/Computation/getComputationSignature';
import Computation from 'viewmodel/Computation/Computation';

export default function createComputations ( viewmodel, computed ) {

	var computations = {};

	for ( let key in computed ) {
		let signature = getComputationSignature( computed[ key ] );
		computations[ key ] = new Computation( viewmodel, key, signature );
	}

	return computations;
}
