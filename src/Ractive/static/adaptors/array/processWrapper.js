export default function ( wrapper, array, methodName, newIndices ) {
	var { root, keypath } = wrapper;

	if ( !!newIndices ) {
		keypath.shuffle( newIndices );
	} else {
		// If this is a sort or reverse, we just do root.set()...
		// TODO use merge logic?
		//root.viewmodel.mark( keypath );
	}
}
