import gatherRefs from '../../view/helpers/gatherRefs';

export default function( node ) {
	if ( !node || !node._ractive ) return {};

	const storage = node._ractive;
	const { key, index } = gatherRefs( storage.fragment );

	return {
		ractive: storage.ractive,
		keypath: storage.keypath,
		rootpath: storage.rootpath,
		index,
		key
	};
}
