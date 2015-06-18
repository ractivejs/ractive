import { removeFromArray } from 'utils/array';
import { handleChange } from 'shared/methodCallers';

export default class KeypathReferenceResolver {
	constructor ( fragment, callback ) {
		// find closest fragment with a context
		while ( !fragment.context ) {
			fragment = fragment.parent;
		}

		this.model = fragment.context;
		this.deps = [];
		this.value = this.model.getKeypath();

		this.model.registerKeypathDependant( this );

		callback( this );
		this.resolved = true;
	}

	getKeypath () {
		return '@keypath';
	}

	handleChange () {
		this.value = this.model.getKeypath();
		this.deps.forEach( handleChange );
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	unbind () {
		this.model.unregisterKeypathDependant( this );
	}

	unregister ( dep ) {
		removeFromArray( this.deps, dep );
	}
}
