notifyDependents = function ( ractive, keypath, onlyDirect ) {
	var i;

	for ( i=0; i<ractive._deps.length; i+=1 ) { // can't cache ractive._deps.length, it may change
		notifyDependentsByPriority( ractive, keypath, i, onlyDirect );
	}
};