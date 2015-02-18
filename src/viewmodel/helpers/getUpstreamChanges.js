import { addToArray } from 'utils/array';

export default function getUpstreamChanges ( changes, rootKeypath ) {
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
