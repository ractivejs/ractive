export default function ( wrapper, array, methodName, newIndices ) {
	var { root, keypath } = wrapper;

	// If this is a sort or reverse, we just do root.set()...
	// TODO use merge logic?
	if ( methodName === 'sort' || methodName === 'reverse' ) {
		root.viewmodel.set( keypath, array );
		return;
	}

	root.viewmodel.smartUpdate( keypath, array, newIndices );
}
