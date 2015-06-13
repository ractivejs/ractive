import { ELEMENT } from 'config/types';

export default function findParentNode ( item ) {
	let fragment = item.parentFragment;

	// TODO the componentParent stuff is mildly confusing, refactor it
	while ( fragment ) {
		if ( fragment.isRoot && !fragment.componentParent ) return fragment.ractive.el;
		if ( fragment.owner.type === ELEMENT ) return fragment.owner.node;

		fragment = fragment.parent || fragment.componentParent;
	}
}
