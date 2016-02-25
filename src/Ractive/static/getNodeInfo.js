import gatherRefs from '../../view/helpers/gatherRefs';

export default function( node ) {
	if ( !node || !node._ractive ) return {};

	const storage = node._ractive;
	const ractive = storage.fragment.ractive;
	const { key, index } = gatherRefs( storage.fragment );
	const context = storage.fragment.findContext();

	return {
		ractive,
		keypath: context.getKeypath( ractive ),
		rootpath: context.getKeypath(),
		index,
		key
	};
}
