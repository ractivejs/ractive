import getSpecialsReferences from 'shared/getSpecialsReferences';

export default function( node ) {
	var storage, specials;

	if ( !node || !( storage = node._ractive ) ) {
		return {};
	}

	specials = getSpecialsReferences( storage.proxy.parentFragment );

	return {
		ractive: storage.root,
		keypath: storage.keypath.getKeypath(),
		index: specials.index,
		key: specials.key
	};

}
