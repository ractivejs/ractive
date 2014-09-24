import normaliseKeypath from 'utils/normaliseKeypath';
import resolveRef from 'shared/resolveRef';

var options = { capture: true }; // top-level calls should be intercepted

export default function Ractive$get ( keypath ) {
	var value;

	keypath = normaliseKeypath( keypath );
	value = this.viewmodel.get( keypath, options );

	// Create inter-component binding, if necessary
	if ( value === undefined && this._parent && !this.isolated ) {
		if ( resolveRef( this, keypath, this.fragment ) ) { // creates binding as side-effect, if appropriate
			value = this.viewmodel.get( keypath );
		}
	}

	return value;
}
