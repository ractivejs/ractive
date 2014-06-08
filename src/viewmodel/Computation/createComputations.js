import getComputationSignature from 'viewmodel/Computation/getComputationSignature';
import Computation from 'viewmodel/Computation/Computation';

export default function createComputations ( ractive, computed ) {
	var key, signature;

	for ( key in computed ) {
		signature = getComputationSignature( computed[ key ] );
		ractive.viewmodel.computations[ key ] = new Computation( ractive, key, signature );
	}
}
