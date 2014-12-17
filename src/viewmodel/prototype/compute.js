import getComputationSignature from '../Computation/getComputationSignature';
import Computation from '../Computation/Computation';

export default function Viewmodel$compute ( key, signature ) {
	signature = getComputationSignature( signature );
	return ( this.computations[ key.str ] = new Computation( this.ractive, key, signature ) );
}
