import { normalise, splitKeypath } from 'shared/keypaths';
import resolveReference from 'view/resolvers/resolveReference';

export default function Ractive$get ( keypath ) {
	if ( !keypath ) return this.viewmodel.value; // TODO include computations/mappings?

	const keys = splitKeypath( keypath );
	const key = keys[0];

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component ) {
			// mapping is created as a side-effect
			resolveReference( this.component.parentFragment, normalise( key ) );
		}
	}

	const model = this.viewmodel.joinAll( keys );
	return model.get();
}
