import getComputationSignature from 'viewmodel/Computation/getComputationSignature';
import Computation from 'viewmodel/Computation/Computation';

export default function Viewmodel$compute ( keypath, signature ) {
	signature = getComputationSignature( signature );
	return ( this.computations[ keypath ] = new Computation( this.ractive, keypath, signature ) );
}
