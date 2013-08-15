notifyDependantsByPriority = function ( ractive, keypath, priority, onlyDirect ) {
	var depsByKeypath, deps, i, childDeps;

	depsByKeypath = ractive._deps[ priority ];

	if ( !depsByKeypath ) {
		return;
	}

	deps = depsByKeypath[ keypath ];

	if ( deps ) {
		i = deps.length;
		while ( i-- ) {
			deps[i].update();
		}
	}

	// If we're only notifying direct dependants, not dependants
	// of downstream keypaths, then YOU SHALL NOT PASS
	if ( onlyDirect ) {
		return;
	}
	

	// cascade
	childDeps = ractive._depsMap[ keypath ];
	
	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			notifyDependantsByPriority( ractive, childDeps[i], priority );
		}
	}
};