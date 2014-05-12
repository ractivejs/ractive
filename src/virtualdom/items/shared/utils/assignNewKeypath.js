import startsWith from 'virtualdom/items/shared/utils/startsWith';
import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
	if ( !target[property] || startsWith(target[property], newKeypath) ) { return; }
	target[property] = getNewKeypath(target[property], oldKeypath, newKeypath);
}
