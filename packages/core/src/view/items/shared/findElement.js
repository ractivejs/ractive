import { ANCHOR, COMPONENT, ELEMENT } from '../../../config/types';

export default function findElement( start, orComponent = true, name ) {
	while ( start && ( start.type !== ELEMENT || ( name && start.name !== name ) ) && ( !orComponent || ( start.type !== COMPONENT && start.type !== ANCHOR ) ) ) {
		// start is a fragment - look at the owner
		if ( start.owner ) start = start.owner;
		// start is a component or yielder - look at the container
		else if ( start.component ) start = start.containerFragment || start.component.parentFragment;
		// start is an item - look at the parent
		else if ( start.parent ) start = start.parent;
		// start is an item without a parent - look at the parent fragment
		else if ( start.parentFragment ) start = start.parentFragment;

		else start = undefined;
	}

	return start;
}
