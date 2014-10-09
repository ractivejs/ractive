import startsWithKeypath from 'virtualdom/items/shared/utils/startsWithKeypath';

export default function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {
	// exact match
	if ( targetKeypath === oldKeypath ) {
		return newKeypath !== undefined ? newKeypath : null;
	}

	// partial match based on leading keypath segments
	if ( startsWithKeypath( targetKeypath, oldKeypath ) ){
		return newKeypath === null ? newKeypath : targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
	}
}
