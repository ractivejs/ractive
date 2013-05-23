/*utils.observe = function ( root, mustache ) {

	var observerRefs = [], observe, keys, priority = mustache.descriptor.p || 0;

	observe = function ( keypath ) {
		var observers;

		observers = root._observers[ keypath ] = root._observers[ keypath ] || [];
		observers = observers[ priority ] = observers[ priority ] || [];

		observers[ observers.length ] = mustache;
		observerRefs[ observerRefs.length ] = {
			keypath: keypath,
			priority: priority,
			mustache: mustache
		};
	};

	keys = utils.splitKeypath( mustache.keypath );
	while ( keys.length ) {
		observe( keys.join( '.' ) );

		// remove the last item in the keypath, so that `data.set( 'parent', { child: 'newValue' } )`
		// affects mustaches dependent on `parent.child`
		keys.pop();
	}

	observe( keys[0] );

	return observerRefs;
};*/