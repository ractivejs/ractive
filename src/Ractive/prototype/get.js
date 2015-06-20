import { splitKeypath } from 'shared/keypaths';
import ReferenceResolver from 'virtualdom/resolvers/ReferenceResolver';

export default function Ractive$get ( keypath ) {
	if ( !keypath ) return this.viewmodel.value; // TODO include computations/mappings?

	const keys = splitKeypath( keypath );
	const key = keys[0];

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component ) {
			const resolver = new ReferenceResolver( this.component.parentFragment, key, model => {
				this.viewmodel.map( key, model );
			});

			// TODO eesh, is there a better approach than this?
			resolver.unbind();
		}
	}

	const model = this.viewmodel.joinAll( keys );
	return model.get();
}
