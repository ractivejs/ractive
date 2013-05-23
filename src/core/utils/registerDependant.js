utils.registerDependant = function ( root, keypath, dependant, priority ) {
	var deps, dependants;

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