import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';
import { FakeFragment } from '../../shared/getRactiveContext';

export default function Ractive$get ( keypath, opts ) {
	if ( typeof keypath !== 'string' ) return this.viewmodel.get( true, keypath );

	const keys = splitKeypath( keypath );
	const key = keys[0];

	let model;

	if ( !this.viewmodel.has( key ) ) {
		// if this is an inline component, we may need to create
		// an implicit mapping
		if ( this.component && !this.isolated ) {
			model = resolveReference( this.fragment || new FakeFragment( this ), key );
		}
	}

	model = this.viewmodel.joinAll( keys );
	return model.get( true, opts );
}
