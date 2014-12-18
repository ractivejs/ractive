import Computation from '../Computation/Computation';

export default function Viewmodel$compute ( key, signature ) {
	var computation = new Computation( key, signature );

	if ( this.ready ) {
		computation.init( this );
	}

	return ( this.computations[ key.str ] = computation );
}
