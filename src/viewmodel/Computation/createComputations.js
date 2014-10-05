import getComputationSignature from 'viewmodel/Computation/getComputationSignature';
import Computation from 'viewmodel/Computation/Computation';

export default function createComputations ( ractive, computed ) {
	var key, signature, computations = ractive.viewmodel.computations, array = [];

	for ( key in computed ) {
		signature = getComputationSignature( computed[ key ] );
		array.push( computations[ key ] = new Computation( ractive, key, signature ) );
	}

	array.forEach( init );
}

function init ( computation ) {
	computation.init();
}
