import { normalise } from 'shared/keypaths';
import resolveRef from 'shared/resolveRef';

var options = {
	capture: true, // top-level calls should be intercepted
	noUnwrap: true // wrapped values should NOT be unwrapped
};

export default function Ractive$get ( keypathStr ) {
	var keypath;

	keypathStr = normalise( keypathStr );

	if( !this.viewmodel.hasKeypath( keypathStr ) ) {
		keypath = resolveRef( this, keypathStr, this.fragment );
	}
	else {
		keypath = this.viewmodel.getKeypath( keypathStr );
	}

	// For now we go through viewmodel to do capture
	return this.viewmodel.get( keypath, options );
}
