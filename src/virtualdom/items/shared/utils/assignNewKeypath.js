import startsWith from 'virtualdom/items/shared/utils/startsWith';
import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
	var existingKeypath = target[ property ];

	if ( !existingKeypath || startsWith( existingKeypath, newKeypath ) || !startsWith( existingKeypath, oldKeypath ) ) {
		return;
	}

	target[ property ] = getNewKeypath( existingKeypath, oldKeypath, newKeypath );
}
