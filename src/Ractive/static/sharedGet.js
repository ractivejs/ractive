import SharedModel  from '../../model/specials/SharedModel';
import { splitKeypath } from 'shared/keypaths';

export default function sharedGet ( keypath ) {
	return SharedModel.joinAll( splitKeypath( keypath ) ).get();
}
