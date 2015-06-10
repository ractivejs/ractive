export default class IndexReferenceResolver {
	constructor ( fragment, indexRef, callback ) {
		this.deps = [];
		this.value = fragment.indexRefs[ indexRef ];
		
		callback( this );

		// we need to attach this to the repeated fragment that this is
		// an index of, so that we get notified on changes
		while ( fragment ) {
			if ( fragment.indexRef === indexRef ) {
				fragment.indexRefResolvers.push( this );
				break;
			}

			fragment = fragment.parent;
		}

		this.resolved = true;
	}

	register ( dep ) {
		this.deps.push( dep );
	}
}
