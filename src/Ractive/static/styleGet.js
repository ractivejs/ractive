import { splitKeypath } from 'shared/keypaths';

export default function styleGet ( keypath ) {
	return this._cssModel.joinAll( splitKeypath( keypath ) ).get();
}
