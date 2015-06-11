import { ELEMENT } from 'config/types';

export default function findParentNode ( item ) {
	let fragment = item.parentFragment;

	while ( fragment ) {
		if ( fragment.isRoot ) return fragment.ractive.el;
		if ( fragment.owner.type === ELEMENT ) return fragment.owner.node;

		fragment = fragment.parent;
	}
}
