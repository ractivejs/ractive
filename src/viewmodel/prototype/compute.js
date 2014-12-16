import getComputationSignature from '../Computation/getComputationSignature';
import Computation from '../Computation/Computation';
import { getKeypath } from 'shared/keypaths';

export default function Viewmodel$compute ( key, signature ) {
	if ( typeof key === 'string' ) {
		throw new Error( 'string' );
	}

	signature = getComputationSignature( signature );
	return ( this.computations[ key ] = new Computation( this.ractive, key, signature ) );
}
