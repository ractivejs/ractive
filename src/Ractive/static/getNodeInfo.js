import { extend } from 'utils/object';

export default function( node ) {
	if ( !node || !node._ractive ) return {};

	const storage = node._ractive;

	return {
		ractive: storage.root,
		keypath: storage.context.getKeypath(),
		index: extend( {}, storage.fragment.indexRefs ),
		key: extend( {}, storage.fragment.keyRefs )
	};
}
