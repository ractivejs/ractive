import { isRactiveElement } from '../../utils/is';
import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';

export default function Ractive$get ( keypath, context ) {
	if ( !keypath ) return this.viewmodel.get( true );
	let model;

	if ( isRactiveElement( context ) ) {
		model = resolveReference( context._ractive.fragment, keypath );
		if ( model ) return model.get( true );
	} else {
		const keys = splitKeypath( keypath );
		const key = keys[0];


		if ( !this.viewmodel.has( key ) ) {
			// if this is an inline component, we may need to create
			// an implicit mapping
			if ( this.component && !this.isolated ) {
				model = resolveReference( this.component.parentFragment, key );

				if ( model ) {
					this.viewmodel.map( key, model );
				}
			}
		}

		model = this.viewmodel.joinAll( keys );
		return model.get( true );
	}
}
