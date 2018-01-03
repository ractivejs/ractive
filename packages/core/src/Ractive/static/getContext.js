import { doc } from '../../config/environment';
import getRactiveContext from '../../shared/getRactiveContext';
import { warnOnceIfDebug } from '../../utils/log';

const query = doc && doc.querySelector;

export default function getContext ( node ) {
	if ( typeof node === 'string' && query ) {
		node = query.call( document, node );
	}

	let instances;
	if ( node ) {
		if ( node._ractive ) {
			return node._ractive.proxy.getContext();
		} else if ( ( instances = node.__ractive_instances__ ) && instances.length === 1 ) {
			return getRactiveContext( instances[0] );
		}
	}
}

export function getNodeInfo ( node ) {
	warnOnceIfDebug( `getNodeInfo has been renamed to getContext, and the getNodeInfo alias will be removed in a future release.` );
	return getContext ( node );
}
