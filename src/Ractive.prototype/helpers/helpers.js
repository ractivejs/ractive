var teardown, clearCache, registerDependant, unregisterDependant, notifyDependants, resolveRef;

teardown = function ( thing ) {
	if ( !thing.keypath ) {
		// this was on the 'unresolved' list, we need to remove it
		var index = thing.root._pendingResolution.indexOf( thing );

		if ( index !== -1 ) {
			thing.root._pendingResolution.splice( index, 1 );
		}

	} else {
		// this was registered as a dependency
		unregisterDependant( thing.root, thing.keypath, thing, thing.priority || 0 );
	}
};

clearCache = function ( root, keypath ) {
	var value, dependants = root._depsMap[ keypath ], i;

	// is this a modified array, which shouldn't fire set events on this keypath anymore?
	if ( root.modifyArrays ) {
		if ( keypath.charAt( 0 ) !== '(' ) { // expressions don't get wrapped
			value = root._cache[ keypath ];
			if ( isArray( value ) && !value._ractive.setting ) {
				unregisterKeypathFromArray( value, keypath, root );
			}
		}
	}
	

	delete root._cache[ keypath ];

	if ( !dependants ) {
		return;
	}

	i = dependants.length;
	while ( i-- ) {
		clearCache( root, dependants[i] );
	}
};



registerDependant = function ( root, keypath, dependant, priority ) {
	var deps;

	if ( !root._deps[ keypath ] ) {
		root._deps[ keypath ] = [];
	}

	deps = root._deps[ keypath ];
	
	if ( !deps[ priority ] ) {
		deps[ priority ] = [ dependant ];
		return;
	}

	deps = deps[ priority ];

	if ( deps.indexOf( dependant ) === -1 ) {
		deps[ deps.length ] = dependant;
	}
};


unregisterDependant = function ( root, keypath, dependant, priority ) {
	var deps, i, keep;

	deps = root._deps[ keypath ][ priority ];
	deps.splice( deps.indexOf( dependant ), 1 );

	if ( !deps.length ) {
		root._deps[ keypath ][ priority ] = null;
	}

	// can we forget this keypath altogether?
	i = root._deps[ keypath ].length;
	while ( i-- ) {
		if ( root._deps[ keypath ][i] ) {
			keep = true;
			break;
		}
	}

	if ( !keep ) {
		// yes, we can forget it
		root._deps[ keypath ] = null;
	}
};

notifyDependants = function ( root, keypath, onlyDirect ) {
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

	// If we're only notifying direct dependants, not dependants
	// of downstream keypaths, then YOU SHALL NOT PASS
	if ( onlyDirect ) {
		return;
	}
	

	// cascade
	childDeps = root._depsMap[ keypath ];
	
	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			notifyDependants( root, childDeps[i] );
			
			// TODO at some point, no-longer extant dependants need to be removed
			// from the map. However a keypath can have no direct dependants yet
			// still have downstream dependants, so it's not entirely straightforward
		}
	}
};


// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
resolveRef = function ( root, ref, contextStack ) {

	var keys, lastKey, innerMostContext, contextKeys, parentValue, keypath;

	// Implicit iterators - i.e. {{.}} - are a special case
	if ( ref === '.' ) {
		return contextStack[ contextStack.length - 1 ];
	}

	keys = splitKeypath( ref );
	lastKey = keys.pop();

	// Clone the context stack, so we don't mutate the original
	contextStack = contextStack.concat();

	// Take each context from the stack, working backwards from the innermost context
	while ( contextStack.length ) {

		innerMostContext = contextStack.pop();
		contextKeys = splitKeypath( innerMostContext );

		parentValue = root.get( contextKeys.concat( keys ) );

		if ( typeof parentValue === 'object' && parentValue.hasOwnProperty( lastKey ) ) {
			keypath = innerMostContext + '.' + ref;
			break;
		}
	}

	if ( !keypath && root.get( ref ) !== undefined ) {
		keypath = ref;
	}

	return keypath;
};