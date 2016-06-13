import { ELEMENT, COMPONENT } from '../../../config/types';

export default function findElement( start ) {
	while ( start && start.type !== ELEMENT && start.type !== COMPONENT ) {
		if ( start.owner ) start = start.owner;
		else if ( start.parent ) start = start.parent;
		else if ( start.parentFragment ) start = start.parentFragment;
		else start = undefined;
	}

	return start;
}
