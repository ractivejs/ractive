export default function ( wrapper, array, methodName, newIndices ) {
	var { __model } = wrapper;

	if ( !!newIndices ) {
		__model.shuffle( newIndices );
	} else {
		// If this is a sort or reverse, we just do root.set()...
		// TODO use merge logic?
		//root.viewmodel.mark( keypath );
	}
}
