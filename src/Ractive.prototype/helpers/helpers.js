var teardown,
	clearCache,
	registerDependant,
	unregisterDependant,
	notifyDependants,
	registerIndexRef,
	unregisterIndexRef,
	resolveRef,
	processDeferredUpdates;

teardown = function ( thing ) {
	if ( !thing.keypath ) {
		// this was on the 'unresolved' list, we need to remove it
		var index = thing.root._pendingResolution.indexOf( thing );

		// TODO unless it was an index ref???

		if ( index !== -1 ) {
			thing.root._pendingResolution.splice( index, 1 );
		}

	} else {
		// this was registered as a dependency
		unregisterDependant( thing.root, thing.keypath, thing, thing.priority || 0 );
	}
};

clearCache = function ( root, keypath ) {
	var value, cachedChildProperties = root._depsMap[ keypath ], i;

	// is this a modified array, which shouldn't fire set events on this keypath anymore?
	if ( root.modifyArrays ) {
		if ( keypath.charAt( 0 ) !== '(' ) { // expressions don't get wrapped (TODO nor should their children!!)
			value = root._cache[ keypath ];
			if ( isArray( value ) && !value._ractive.setting ) {
				unregisterKeypathFromArray( value, keypath, root );
			}
		}
	}
	
	// TODO set to undefined or null instead of deleting? more performant,
	// but means we can't use hasOwnProperty check. If a value is undefined
	// 'deliberately', it could trip us up...
	root._cache[ keypath ] = UNSET;

	// TODO can we do this without enumeration? deps map is not a solution
	var len, kp;
	len = keypath.length;
	for ( kp in root._cache ) {
		if ( kp.substr( 0, len ) === keypath ) {
			root._cache[ kp ] = UNSET;
		}
	}
};



registerDependant = function ( root, keypath, dependant, priority ) {
	var depsByPriority, deps, keys, parentKeypath, map;

	if ( !root._deps[ keypath ] ) {
		root._deps[ keypath ] = [];
	}

	depsByPriority = root._deps[ keypath ];
	
	if ( !( deps = depsByPriority[ priority ] ) ) {
		depsByPriority[ priority ] = [ dependant ];
	} else {
		deps[ deps.length ] = dependant;
	}


	// update dependants map
	keys = splitKeypath( keypath );
	
	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );
	
		if ( !root._depsMap[ parentKeypath ] ) {
			root._depsMap[ parentKeypath ] = [];
		}

		map = root._depsMap[ parentKeypath ];

		if ( !map.hasOwnProperty( keypath ) ) {
			map[ keypath ] = 0;
			map[ map.length ] = keypath;
		}

		map[ keypath ] += 1;

		keypath = parentKeypath;
	}
};


unregisterDependant = function ( root, keypath, dependant, priority ) {
	var deps, i, keep, keys, parentKeypath, map;

	deps = root._deps[ keypath ][ priority ];
	deps.splice( deps.indexOf( dependant ), 1 );

	if ( root._evaluators[ keypath ] ) {
		// we have an evaluator we don't need anymore
		root._evaluators[ keypath ].teardown();
	}

	
	// update dependants map
	keys = splitKeypath( keypath );
	
	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );
	
		map = root._depsMap[ parentKeypath ];

		map[ keypath ] -= 1;

		if ( !map[ keypath ] ) {
			// remove from parent deps map
			map.splice( map.indexOf( keypath ), 1 );
		}

		keypath = parentKeypath;
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

		if ( typeof parentValue === 'object' && parentValue !== null && parentValue.hasOwnProperty( lastKey ) ) {
			keypath = innerMostContext + '.' + ref;
			break;
		}
	}

	if ( !keypath && root.get( ref ) !== undefined ) {
		keypath = ref;
	}

	return keypath;
};


processDeferredUpdates = function ( root ) {
	var evaluator, attribute;

	while ( root._defEvals.length ) {
		 evaluator = root._defEvals.pop();
		 evaluator.update().deferred = false;
	}

	while ( root._defAttrs.length ) {
		attribute = root._defAttrs.pop();
		attribute.update().deferred = false;
	}
};