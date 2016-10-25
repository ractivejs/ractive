import { ANCHOR, COMPONENT, ELEMENT } from '../../../config/types';

export default function findElement( start, orComponent = true ) {
	while ( start && start.type !== ELEMENT && ( !orComponent || ( start.type !== COMPONENT && start.type !== ANCHOR ) ) ) {
		if ( start.owner ) start = start.owner;
		else if ( start.component ) start = start.component.parentFragment;
		else if ( start.parent ) start = start.parent;
		else if ( start.parentFragment ) start = start.parentFragment;
		else start = undefined;
	}

	return start;
}
