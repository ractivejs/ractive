unregisterDependant = function ( dependant ) {
	var deps, keys, parentKeypath, map, ractive, keypath, priority, evaluator;

	ractive = dependant.root;
	keypath = dependant.keypath;
	priority = dependant.priority;

	deps = ractive._deps[ priority ][ keypath ];
	deps.splice( deps.indexOf( dependant ), 1 );

	// update dependants map
	keys = splitKeypath( keypath );

	// If this keypath is an evaluator, decrement its dependants property.
	// That way, if an evaluator doesn't have any remaining dependants (temporarily
	// or permanently) we can put it to sleep, preventing unnecessary work
	if ( evaluator = ractive._evaluators[ keypath ] ) {
		evaluator.dependants -= 1;
		
		if ( !evaluator.dependants ) {
			evaluator.sleep();
		}
	}
	
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