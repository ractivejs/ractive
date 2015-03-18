import { addToArray } from 'utils/array';
import { rootKeypath } from 'shared/keypaths'; // TEMP

export default function getUpstreamChanges ( changes ) {
	var upstreamChanges = [ rootKeypath ], i, keypath;

	i = changes.length;
	while ( i-- ) {
		keypath = changes[i].parent;

		while ( keypath && !keypath.isRoot ) {
			if( changes.indexOf(keypath) === -1 ) {
				addToArray( upstreamChanges, keypath );
			}
			keypath = keypath.parent;
		}
	}

	return upstreamChanges;
}
