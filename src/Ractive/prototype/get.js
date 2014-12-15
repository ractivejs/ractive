import { getKeypath, normalise } from 'shared/keypaths';
import resolveRef from 'shared/resolveRef';

var options = {
	capture: true, // top-level calls should be intercepted
	noUnwrap: true // wrapped values should NOT be unwrapped
};

export default function Ractive$get ( keypath ) {
	var value;

	keypath = getKeypath( normalise( keypath ) );
	value = this.viewmodel.get( keypath, options );

	// Create inter-component binding, if necessary
	if ( value === undefined && this.parent && !this.isolated ) {
		if ( resolveRef( this, keypath.str, this.component.parentFragment ) ) { // creates binding as side-effect, if appropriate
			value = this.viewmodel.get( keypath );
		}
	}

	return value;
}
