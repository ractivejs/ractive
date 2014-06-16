export default function getUpstreamChanges ( changes ) {
	var upstreamChanges = [ '' ], i, keypath, keys, upstreamKeypath;

	i = changes.length;
	while ( i-- ) {
		keypath = changes[i];
		keys = keypath.split( '.' );

		while ( keys.length > 1 ) {
			keys.pop();
			upstreamKeypath = keys.join( '.' );

			if ( upstreamChanges.indexOf( upstreamKeypath ) === -1 ) {
				upstreamChanges.push( upstreamKeypath );
			}
		}
	}

	return upstreamChanges;
}
