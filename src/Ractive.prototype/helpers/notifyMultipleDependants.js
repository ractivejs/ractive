notifyMultipleDependents = function ( ractive, keypaths, onlyDirect ) {
	var  i, j, len;

	len = keypaths.length;

	for ( i=0; i<ractive._deps.length; i+=1 ) {
		if ( ractive._deps[i] ) {
			j = len;
			while ( j-- ) {
				notifyDependentsByPriority( ractive, keypaths[j], i, onlyDirect );
			}
		}
	}
};