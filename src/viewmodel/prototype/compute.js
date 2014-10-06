import getComputationSignature from 'viewmodel/Computation/getComputationSignature';
import Computation from 'viewmodel/Computation/Computation';

export default function Viewmodel$compute ( key, signature ) {
	signature = getComputationSignature( signature );
	return ( this.computations[ key ] = new Computation( this.ractive, key, signature ) );
}
