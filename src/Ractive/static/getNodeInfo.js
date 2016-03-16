import gatherRefs from '../../view/helpers/gatherRefs';
import { addHelpers } from '../../view/helpers/contextMethods';

export default function( node ) {
	if ( !node || !node._ractive ) return {};

	const storage = node._ractive;

	return addHelpers( {}, storage.proxy );
}
