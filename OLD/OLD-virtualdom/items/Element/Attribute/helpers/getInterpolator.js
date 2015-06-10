import { INTERPOLATOR } from 'config/types';

export default function getInterpolator ( attribute ) {
	var items = attribute.fragment.items;

	if ( items.length !== 1 ) {
		return;
	}

	if ( items[0].type === INTERPOLATOR ) {
		return items[0];
	}
}
