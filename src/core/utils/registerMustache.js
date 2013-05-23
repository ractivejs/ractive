/*utils.registerMustache = function ( root, mustache ) {
	var resolved, value, index, keypath;

	if ( mustache.parentFragment.indexRefs && ( mustache.parentFragment.indexRefs.hasOwnProperty( mustache.descriptor.r ) ) ) {
		// This isn't a real keypath, it's an index reference
		index = mustache.parentFragment.indexRefs[ mustache.descriptor.r ];
		mustache.update( index );

		return; // This value will never change, and doesn't have a keypath
	}

	// See if we can resolve a keypath from this mustache's reference (e.g.
	// does 'bar' in {{#foo}}{{bar}}{{/foo}} mean 'bar' or 'foo.bar'?)
	keypath = utils.resolveRef( root, mustache.descriptor.r, mustache.contextStack );

	if ( keypath ) {
		mustache.keypath = keypath;
		mustache.keys = utils.splitKeypath( mustache.keypath );

		mustache.observerRefs = utils.observe( root, mustache );
		mustache.update( root.get( mustache.keypath ) );

	} else {
		root._pendingResolution[ root._pendingResolution.length ] = mustache;
	}
};*/