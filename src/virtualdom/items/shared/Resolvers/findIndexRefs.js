export default findIndexRefs;

function findIndexRefs( fragment, refName ) {
	var result = {}, refs, fragRefs, ref, i, owner, hit = false;

	if ( !refName ) {
		result.refs = refs = {};
	}

	while ( fragment ) {
		if ( ( owner = fragment.owner ) && ( fragRefs = owner.indexRefs ) ) {

			// we're looking for a particular ref, and it's here
			if ( refName && ( ref = owner.getIndexRef( refName ) ) ) {
				result.ref = {
					fragment: fragment,
					ref: ref
				};
				return result;
			}

			// we're collecting refs up-tree
			else if ( !refName ) {
				for ( i in fragRefs ) {
					ref = fragRefs[i];

					// don't overwrite existing refs - they should shadow parents
					if ( !refs[ref.n] ) {
						hit = true;
						refs[ref.n] = {
							fragment: fragment,
							ref: ref
						};
					}
				}
			}
		}

		// watch for component boundaries
		if ( !fragment.parent && fragment.owner &&
		     fragment.owner.component && fragment.owner.component.parentFragment &&
		     !fragment.owner.component.instance.isolated ) {
			result.componentBoundary = true;
			fragment = fragment.owner.component.parentFragment;
		} else {
			fragment = fragment.parent;
		}
	}

	if ( !hit ) {
		return undefined;
	} else {
		return result;
	}
}

findIndexRefs.resolve = function resolve( indices ) {
	var refs = {}, k, ref;

	for ( k in indices.refs ) {
		ref = indices.refs[k];
		refs[ ref.ref.n ] = ref.ref.t === 'k' ? ref.fragment.key : ref.fragment.index;
	}

	return refs;
};
