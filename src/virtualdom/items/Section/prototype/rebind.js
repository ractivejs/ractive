import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';
import types from 'config/types';

export default function( indexRef, newIndex, oldKeypath, newKeypath ) {
	var ref, idx;

	if ( indexRef !== undefined || this.currentSubtype !== types.SECTION_EACH ) {
		ref = indexRef;
		idx = newIndex;
	}

	// If the new index belonged to us, we'd be shuffling instead
	Mustache.rebind.call( this, ref, idx, oldKeypath, newKeypath );
}
