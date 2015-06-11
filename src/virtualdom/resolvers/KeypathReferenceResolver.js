import { removeFromArray } from 'utils/array';

export default class KeypathReferenceResolver {
	constructor ( fragment, callback ) {
		// find closest fragment with a context
		while ( !fragment.context ) {
			fragment = fragment.parent;
		}

		this.fragment = fragment;
		this.deps = [];
		this.value = fragment.context.getKeypath();

		callback( this );

		// TODO what happens when it changes? Need to register with the fragment
		this.resolved = true;
	}

	getKeypath () {
		return '@keypath';
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	unregister ( dep ) {
		removeFromArray( this.deps, dep );
	}
}
