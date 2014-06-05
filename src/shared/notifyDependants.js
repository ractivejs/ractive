import notifyPatternObservers from 'shared/notifyPatternObservers';
import circular from 'circular';

var get,
	unwrap = { evaluateWrapped: true };

circular.push( function () {
	get = circular.get;
});

function notifyDependants ( ractive, keypath, onlyDirect ) {
	var i;

	// Notify any pattern observers
	if ( ractive._patternObservers.length ) {
		notifyPatternObservers( ractive, keypath, keypath, onlyDirect, true );
	}

	for ( i=0; i<ractive._deps.length; i+=1 ) { // can't cache ractive._deps.length, it may change
		notifyDependantsAtPriority( ractive, keypath, i, onlyDirect );
	}
}

notifyDependants.multiple = function notifyMultipleDependants ( ractive, keypaths, onlyDirect ) {
	var i, j, len;

	len = keypaths.length;

	// Notify any pattern observers
	if ( ractive._patternObservers.length ) {
		i = len;
		while ( i-- ) {
			notifyPatternObservers( ractive, keypaths[i], keypaths[i], onlyDirect, true );
		}
	}

	for ( i=0; i<ractive._deps.length; i+=1 ) {
		if ( ractive._deps[i] ) {
			j = len;
			while ( j-- ) {
				notifyDependantsAtPriority( ractive, keypaths[j], i, onlyDirect );
			}
		}
	}
};

export default notifyDependants;

function notifyDependantsAtPriority ( ractive, keypath, priority, onlyDirect ) {
	var depsByKeypath = ractive._deps[ priority ], value, unwrapped;

	if ( !depsByKeypath ) {
		return;
	}

	// update dependants of this keypath
	value = get( ractive, keypath );
	unwrapped = get( ractive, keypath, unwrap );

	updateAll( depsByKeypath[ keypath ], value, unwrapped );

	// If we're only notifying direct dependants, not dependants
	// of downstream keypaths, then YOU SHALL NOT PASS
	if ( onlyDirect ) {
		return;
	}

	// otherwise, cascade
	cascade( ractive._depsMap[ keypath ], ractive, priority );
}

function updateAll ( dependants, value, unwrapped ) {
	if ( dependants ) {
		dependants.forEach( d => d.setValue( value, unwrapped ) );
	}
}

function cascade ( childDeps, ractive, priority, onlyDirect ) {
	var i;

	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			notifyDependantsAtPriority( ractive, childDeps[i], priority, onlyDirect );
		}
	}
}
