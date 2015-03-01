import { normalise } from 'shared/keypaths';

var options = {
	capture: true, // top-level calls should be intercepted
	noUnwrap: true // wrapped values should NOT be unwrapped
};

export default function Ractive$get ( keypath ) {

	var model = this.viewmodel.getModel( keypath );

	// For now we go through viewmodel to do capture
	return this.viewmodel.get( model, options );
}
