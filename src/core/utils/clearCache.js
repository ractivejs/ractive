utils.clearCache = function ( root, keypath ) {
	var value, dependants = root._depsMap[ keypath ], i;

	// is this a modified array, which shouldn't fire set events on this keypath anymore?
	if ( root.modifyArrays ) {
		value = root._cache[ keypath ];
		if ( utils.isArray( value ) && !value._ractive.setting ) {
			utils.removeKeypath( value, keypath, root );
		}
	}
	

	delete root._cache[ keypath ];

	if ( !dependants ) {
		return;
	}

	i = dependants.length;
	while ( i-- ) {
		utils.clearCache( root, dependants[i] );
	}
};