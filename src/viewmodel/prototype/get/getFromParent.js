import createComponentBinding from 'shared/createComponentBinding';

export default function getFromParent ( child, keypath ) {
	var parent, fragment, keypathToTest, value, index;

	parent = child._parent;

	fragment = child.component.parentFragment;

	// Special case - index refs
	if ( fragment.indexRefs && ( index = fragment.indexRefs[ keypath ] ) !== undefined ) {
		// create an index ref binding, so that it can be rebound letter if necessary
		child.component.indexRefBindings[ keypath ] = keypath;
		return index;
	}

	do {
		if ( !fragment.context ) {
			continue;
		}

		keypathToTest = fragment.context + '.' + keypath;
		value = parent.viewmodel.get( keypathToTest );

		if ( value !== undefined ) {
			createLateComponentBinding( parent, child, keypathToTest, keypath, value );
			return value;
		}
	} while ( fragment = fragment.parent );

	value = parent.viewmodel.get( keypath );
	if ( value !== undefined ) {
		createLateComponentBinding( parent, child, keypath, keypath, value );
		return value;
	}
}

function createLateComponentBinding ( parent, child, parentKeypath, childKeypath, value ) {
	child.viewmodel.set( childKeypath, value, true );
	createComponentBinding( child.component, parent, parentKeypath, childKeypath );
}
