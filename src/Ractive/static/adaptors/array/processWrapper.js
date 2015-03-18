export default function ( wrapper, array, methodName, newIndices ) {
	var { root, keypath } = wrapper;

	if ( !!newIndices ) {
		root.viewmodel.smartUpdate( keypath, array, newIndices );
	} else {
		// If this is a sort or reverse, we just do root.set()...
		// TODO use merge logic?
		root.viewmodel.mark( keypath );
	}
}
