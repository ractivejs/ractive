import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';

export default function( indexRef, newIndex, oldKeypath, newKeypath ) {
	var ref, idx;

	if ( indexRef !== undefined ) {
		ref = indexRef;
		idx = newIndex;
	}

	// If the new index belonged to us, we'd be shuffling instead
	Mustache.rebind.call( this, ref, idx, oldKeypath, newKeypath );
}
