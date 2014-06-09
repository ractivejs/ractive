import normaliseKeypath from 'utils/normaliseKeypath';

var options = { capture: true }; // top-level calls should be intercepted

export default function Ractive$get ( keypath ) {
	keypath = normaliseKeypath( keypath );
	return this.viewmodel.get( keypath, options );
}
