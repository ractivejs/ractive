import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';

export default function Ractive$get ( keypath, opts ) {
	if ( typeof keypath !== 'string' ) return this.viewmodel.get( true, keypath );

	const keys = splitKeypath( keypath );
	const key = keys[0];

	let model;

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component && !this.isolated ) {
			model = resolveReference( this.component.parentFragment, key );

			if ( model ) {
				this.viewmodel.map( key, model, { implicit: true } );
			}
		}
	}

	model = this.viewmodel.joinAll( keys );
	return model.get( true, opts );
}
