export default function gatherRefs( fragment ) {
	let key = {}, index = {};

	// walk up the template gather refs as we go
	while ( fragment ) {
		if ( fragment.parent && ( fragment.parent.indexRef || fragment.parent.keyRef ) ) {
			let ref = fragment.parent.indexRef;
			if ( ref && !( ref in index ) ) index[ref] = fragment.index;
			ref = fragment.parent.keyRef;
			if ( ref && !( ref in key ) ) key[ref] = fragment.key;
		}

		if ( fragment.componentParent && !fragment.ractive.isolated ) {
			fragment = fragment.componentParent;
		} else {
			fragment = fragment.parent;
		}
	}

	return { key, index };
}
