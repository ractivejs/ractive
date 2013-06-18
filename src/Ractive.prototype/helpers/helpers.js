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

		if ( index !== -1 ) {
			thing.root._pendingResolution.splice( index, 1 );
		}

	} else {
		// this was registered as a dependant
		unregisterDependant( thing );
	}
};

clearCache = function ( root, keypath ) {
	var value, len, kp, cacheMap;

	// is this a modified array, which shouldn't fire set events on this keypath anymore?
	if ( root.modifyArrays ) {
		if ( keypath.charAt( 0 ) !== '(' ) { // expressions (and their children) don't get wrapped
			value = root._cache[ keypath ];
			if ( isArray( value ) && !value._ractive.setting ) {
				unregisterKeypathFromArray( value, keypath, root );
			}
		}
	}
	
	root._cache[ keypath ] = UNSET;

	if ( cacheMap = root._cacheMap[ keypath ] ) {
		while ( cacheMap.length ) {
			clearCache( root, cacheMap.pop() );
		}
	}
};



registerDependant = function ( dependant ) {
	var depsByKeypath, deps, keys, parentKeypath, map, root, keypath, priority;

	root = dependant.root;
	keypath = dependant.keypath;
	priority = dependant.priority;

	if ( !root._deps[ priority ] ) {
		root._deps[ priority ] = {};
	}

	depsByKeypath = root._deps[ priority ];

	if ( !depsByKeypath[ keypath ] ) {
		depsByKeypath[ keypath ] = [];
	}

	deps = depsByKeypath[ keypath ];

	deps[ deps.length ] = dependant;

	// if this is an evaluator keypath, let the evaluator know about the dependant
	if ( root._evaluators[ keypath ] ) {
		root._evaluators[ keypath ].deps += 1;
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


unregisterDependant = function ( dependant ) {
	var deps, i, keep, keys, parentKeypath, map, evaluator, root, keypath, priority;

	root = dependant.root;
	keypath = dependant.keypath;
	priority = dependant.priority;

	deps = root._deps[ priority ][ keypath ];
	deps.splice( deps.indexOf( dependant ), 1 );

	// if this is an evaluator keypath, let the evaluator know about the dependant
	if ( evaluator = root._evaluators[ keypath ] ) {
		evaluator.deps -= 1;

		if ( !evaluator.deps ) {
			// we have an evaluator we don't need anymore
			evaluator.teardown();
		}
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
	var i;

	for ( i=0; i<root._deps.length; i+=1 ) { // can't cache root._deps.length, it may change
		notifyDependantsByPriority( root, keypath, i, onlyDirect );
	}
};

var notifyDependantsByPriority = function ( root, keypath, priority, onlyDirect ) {
	var depsByKeypath, deps, i, len, childDeps;

	depsByKeypath = root._deps[ priority ];

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
	childDeps = root._depsMap[ keypath ];
	
	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			notifyDependantsByPriority( root, childDeps[i], priority );
		}
	}
};

var notifyMultipleDependants = function ( root, keypaths, onlyDirect ) {
	var depsByKeypath, i, j, len;

	len = keypaths.length;

	for ( i=0; i<root._deps.length; i+=1 ) {
		depsByKeypath = root._deps[i];

		j = len;
		while ( j-- ) {
			notifyDependantsByPriority( root, keypaths[j], i, onlyDirect );
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

	// References prepended with '.' are another special case
	if ( ref.charAt( 0 ) === '.' ) {
		return contextStack[ contextStack.length - 1 ] + ref;
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