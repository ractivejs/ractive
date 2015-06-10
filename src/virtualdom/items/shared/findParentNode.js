import { ELEMENT } from 'config/types';

export default function findParentNode ( item ) {
	let fragment = item.parentFragment;
	while ( fragment.owner.type !== ELEMENT ) {
		fragment = fragment.parent;
	}

	return fragment.owner.node;
}
