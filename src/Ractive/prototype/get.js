import { splitKeypath } from 'shared/keypaths';

export default function Ractive$get ( keypath ) {
	const model = this.viewmodel.join( splitKeypath( keypath ) );
	return model.get();
}
