import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';

export default function Ractive$get ( keypath ) {
	if ( !keypath ) {
		const result = this.viewmodel.get( true );

		// merge in alt context if available
		if ( this.component && result.hasOwnProperty( 'this' ) ) {
			for ( let k in result.this ) {
				if ( !result.hasOwnProperty( k ) ) {
					result[k] = result.this[k];
				}
			}
			delete result.this;
		}

		return result;
	}

	const keys = splitKeypath( keypath );
	const key = keys[0];

	let model;

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component ) {
			if ( this.viewmodel.has( 'this' ) && this.viewmodel.joinKey( 'this' ).has( key ) ) {
				keys.unshift( 'this' );
			} else {
				model = resolveReference( this.component.parentFragment, key );

				if ( model ) {
					this.viewmodel.map( key, model );
				}
			}
		}
	}

	model = this.viewmodel.joinAll( keys );
	return model.get( true );
}
