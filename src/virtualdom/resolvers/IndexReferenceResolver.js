export default class IndexReferenceResolver {
	constructor ( fragment, indexRef, callback ) {
		this.deps = [];
		this.value = indexRef === '@index' ? fragment.index : fragment.indexRefs[ indexRef ];

		callback( this );

		// we need to attach this to the repeated fragment that this is
		// an index of, so that we get notified on changes
		if ( indexRef !== '@index' ) {
			while ( fragment ) {
				if ( fragment.indexRef === indexRef ) break;
				fragment = fragment.parent;
			}
		}

		fragment.indexRefResolvers.push( this );
		this.resolved = true;
	}

	getKeypath () {
		return '@index';
	}

	register ( dep ) {
		this.deps.push( dep );
	}
}
