utils.unregisterDependant = function ( root, keypath, dependant, priority ) {
	var deps, dependants, i, keep;

	deps = root._deps[ keypath ][ priority ];
	deps.splice( deps.indexOf( dependant ), 1 );

	if ( !deps.length ) {
		root._deps[ keypath ].splice( priority, 1 );
	}

	// can we forget this keypath altogether?
	// TODO should we delete it? may be better to keep it, so we don't need to
	// create again in future
	i = root._deps[ keypath ].length;
	while ( i-- ) {
		if ( root._deps[ keypath ][i] ) {
			keep = true;
			break;
		}
	}

	if ( !keep ) {
		delete root._deps[ keypath ];
	}
};