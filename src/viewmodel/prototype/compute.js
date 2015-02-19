import Computation from '../Computation/Computation';

export default function Viewmodel$compute ( keypath, signature, initialValue ) {
	// TODO can this be a ComputationKeypath?
	var computation = new Computation( keypath, signature, initialValue );
	keypath.setComputation( computation );

	return computation;
}
