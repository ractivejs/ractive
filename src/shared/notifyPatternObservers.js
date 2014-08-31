import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

var lastKey = /[^\.]+$/;

// TODO split into two functions? i.e. one for the top-level call, one for the cascade
export default function notifyPatternObservers ( ractive, registeredKeypath, actualKeypath, isParentOfChangedKeypath, isTopLevelCall ) {
	var i, patternObserver, children, child, key, childActualKeypath, potentialWildcardMatches, cascade;

	// First, observers that match patterns at the same level
	// or higher in the tree
	i = ractive.viewmodel.patternObservers.length;
	while ( i-- ) {
		patternObserver = ractive.viewmodel.patternObservers[i];

		if ( patternObserver.regex.test( actualKeypath ) ) {
			patternObserver.update( actualKeypath );
		}
	}


	if ( isParentOfChangedKeypath ) {
		return;
	}

	// If the changed keypath is 'foo.bar', we need to see if there are
	// any pattern observer dependants of keypaths below any of
	// 'foo.bar', 'foo.*', '*.bar' or '*.*' (e.g. 'foo.bar.*' or 'foo.*.baz' )
	cascade = function ( keypath ) {
		if ( children = ractive.viewmodel.depsMap[ keypath ] ) {
			i = children.length;
			while ( i-- ) {
				child = children[i]; // foo.*.baz

				key = lastKey.exec( child )[0]; // 'baz'
				childActualKeypath = actualKeypath ? actualKeypath + '.' + key : key; // 'foo.bar.baz'

				notifyPatternObservers( ractive, child, childActualKeypath ); // ractive, 'foo.*.baz', 'foo.bar.baz'
			}
		}
	};

	if ( isTopLevelCall ) {
		potentialWildcardMatches = getPotentialWildcardMatches( actualKeypath );
		potentialWildcardMatches.forEach( cascade );
	}

	else {
		cascade( registeredKeypath );
	}
}

