import equalsOrStartsWith from 'shared/keypaths/equalsOrStartsWith';
import getNewKeypath from 'shared/keypaths/getNew';

export default function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
	var existingKeypath = target[ property ];

	if ( !existingKeypath || equalsOrStartsWith( existingKeypath, newKeypath ) || !equalsOrStartsWith( existingKeypath, oldKeypath ) ) {
		return;
	}

	target[ property ] = getNewKeypath( existingKeypath, oldKeypath, newKeypath );
	return true;
}
