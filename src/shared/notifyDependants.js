define( function () {
	
	'use strict';

	var notifyDependants = function ( ractive, keypath, onlyDirect ) {
		var i;

		for ( i=0; i<ractive._deps.length; i+=1 ) { // can't cache ractive._deps.length, it may change
			notifyDependantsAtPriority( ractive, keypath, i, onlyDirect );
		}
	};

	notifyDependants.multiple = function ( ractive, keypaths, onlyDirect ) {
		var  i, j, len;

		len = keypaths.length;

		for ( i=0; i<ractive._deps.length; i+=1 ) {
			if ( ractive._deps[i] ) {
				j = len;
				while ( j-- ) {
					notifyDependantsAtPriority( ractive, keypaths[j], i, onlyDirect );
				}
			}
		}
	};

	return notifyDependants;



	function notifyDependantsAtPriority ( ractive, keypath, priority, onlyDirect ) {
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
				notifyDependantsAtPriority( ractive, childDeps[i], priority );
			}
		}
	}

});