import getComputationSignature from 'Ractive/initialise/computations/getComputationSignature';
import Computation from 'Ractive/initialise/computations/Computation';

export default function createComputations ( ractive, computed ) {
    var key, signature;

    for ( key in computed ) {
        signature = getComputationSignature( computed[ key ] );
        ractive._computations[ key ] = new Computation( ractive, key, signature );
    }
};
