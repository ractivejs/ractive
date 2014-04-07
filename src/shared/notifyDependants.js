define( function () {

	'use strict';

	var lastKey, starMaps = {};

	lastKey = /[^\.]+$/;

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

	return notifyDependants;



	function notifyDependantsAtPriority ( ractive, keypath, priority, onlyDirect ) {
		var depsByKeypath = ractive._deps[ priority ];

		if ( !depsByKeypath ) {
			return;
		}

		// update dependants of this keypath
		updateAll( depsByKeypath[ keypath ] );

		// If we're only notifying direct dependants, not dependants
		// of downstream keypaths, then YOU SHALL NOT PASS
		if ( onlyDirect ) {
			return;
		}

		// otherwise, cascade
		cascade( ractive._depsMap[ keypath ], ractive, priority );
	}

	function updateAll ( deps ) {
		var i, len;

		if ( deps ) {
			len = deps.length;
			for ( i = 0; i < len; i += 1 ) {
				deps[i].update();
			}
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

	// TODO split into two functions? i.e. one for the top-level call, one for the cascade
	function notifyPatternObservers ( ractive, registeredKeypath, actualKeypath, isParentOfChangedKeypath, isTopLevelCall ) {
		var i, patternObserver, children, child, key, childActualKeypath, potentialWildcardMatches, cascade;

		// First, observers that match patterns at the same level
		// or higher in the tree
		i = ractive._patternObservers.length;
		while ( i-- ) {
			patternObserver = ractive._patternObservers[i];

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
			if ( children = ractive._depsMap[ keypath ] ) {
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

	// This function takes a keypath such as 'foo.bar.baz', and returns
	// all the variants of that keypath that include a wildcard in place
	// of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
	// These are then checked against the dependants map (ractive._depsMap)
	// to see if any pattern observers are downstream of one or more of
	// these wildcard keypaths (e.g. 'foo.bar.*.status')
	function getPotentialWildcardMatches ( keypath ) {
		var keys, starMap, mapper, i, result, wildcardKeypath;

		keys = keypath.split( '.' );
		starMap = getStarMap( keys.length );

		result = [];

		mapper = function ( star, i ) {
			return star ? '*' : keys[i];
		};

		i = starMap.length;
		while ( i-- ) {
			wildcardKeypath = starMap[i].map( mapper ).join( '.' );

			if ( !result[ wildcardKeypath ] ) {
				result.push( wildcardKeypath );
				result[ wildcardKeypath ] = true;
			}
		}

		return result;
	}

	// This function returns all the possible true/false combinations for
	// a given number - e.g. for two, the possible combinations are
	// [ true, true ], [ true, false ], [ false, true ], [ false, false ].
	// It does so by getting all the binary values between 0 and e.g. 11
	function getStarMap ( num ) {
		var ones = '', max, binary, starMap, mapper, i;

		if ( !starMaps[ num ] ) {
			starMap = [];

			while ( ones.length < num ) {
				ones += 1;
			}

			max = parseInt( ones, 2 );

			mapper = function ( digit ) {
				return digit === '1';
			};

			for ( i = 0; i <= max; i += 1 ) {
				binary = i.toString( 2 );
				while ( binary.length < num ) {
					binary = '0' + binary;
				}

				starMap[i] = Array.prototype.map.call( binary, mapper );
			}

			starMaps[ num ] = starMap;
		}

		return starMaps[ num ];
	}

});
