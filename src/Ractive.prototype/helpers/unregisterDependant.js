unregisterDependent = function ( dependent ) {
	var deps, i, keep, keys, parentKeypath, map, evaluator, ractive, keypath, priority;

	ractive = dependent.root;
	keypath = dependent.keypath;
	priority = dependent.priority;

	deps = ractive._deps[ priority ][ keypath ];
	deps.splice( deps.indexOf( dependent ), 1 );

	// update dependents map
	keys = splitKeypath( keypath );
	
	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );
	
		map = ractive._depsMap[ parentKeypath ];

		map[ keypath ] -= 1;

		if ( !map[ keypath ] ) {
			// remove from parent deps map
			map.splice( map.indexOf( keypath ), 1 );
			map[ keypath ] = undefined;
		}

		keypath = parentKeypath;
	}
};