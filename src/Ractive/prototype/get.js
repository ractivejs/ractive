import { normalise } from 'shared/keypaths';

var options = {
	capture: true, // top-level calls should be intercepted
	noUnwrap: true, // wrapped values should NOT be unwrapped
	fullRootGet: true // root get should return mappings
};

export default function Ractive$get ( keypath ) {
	const model = this.viewmodel.join( normalise( keypath ).split( '.' ) );
	return model.get();
}
