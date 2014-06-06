import getComputationSignature from 'Ractive/computations/getComputationSignature';
import Computation from 'Ractive/computations/Computation';

export default function createComputations ( ractive, computed ) {
	var key, signature;

	for ( key in computed ) {
		signature = getComputationSignature( computed[ key ] );
		ractive.viewmodel.computations[ key ] = new Computation( ractive, key, signature );
	}
}
