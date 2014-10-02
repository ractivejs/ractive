import getComputationSignature from 'viewmodel/Computation/getComputationSignature';
import Computation from 'viewmodel/Computation/Computation';

export default function createComputations ( ractive, computed ) {
	var key, signature, computations = ractive.viewmodel.computations;

	for ( key in computed ) {
		signature = getComputationSignature( computed[ key ] );
		computations[ key ] = new Computation( ractive, key, signature );
	}

	for ( key in computations ) {
		computations[ key ].update();
	}
}
