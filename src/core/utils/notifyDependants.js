utils.notifyDependants = function ( root, keypath ) {
	var depsByPriority, deps, i, j, len, childDeps;

	depsByPriority = root._deps[ keypath ];

	if ( depsByPriority ) {
		len = depsByPriority.length;
		for ( i=0; i<len; i+=1 ) {
			deps = depsByPriority[i];

			if ( deps ) {
				j = deps.length;
				while ( j-- ) {
					deps[j].update();
				}
			}
		}
	}

	

	// cascade
	childDeps = root._depsMap[ keypath ];
	
	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {

			utils.notifyDependants( root, childDeps[i] );
			
			// TODO at some point, no-longer extant dependants need to be removed
			// from the map. However a keypath can have no direct dependants yet
			// still have downstream dependants, so it's not entirely straightforward
		}
	}
};