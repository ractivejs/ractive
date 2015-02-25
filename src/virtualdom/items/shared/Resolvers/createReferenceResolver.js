import SpecialResolver from './SpecialResolver';
import IndexResolver from './IndexResolver';
import findIndexRefs from './findIndexRefs';

export default function createReferenceResolver ( owner, ref, callback ) {
	var indexRef;

	if ( isSpecialResolver( ref ) ) {
		return new SpecialResolver( owner, ref, callback );
	}

	if ( indexRef = isIndexResolver( owner, ref ) ) {
		return new IndexResolver( owner, indexRef, callback );
	}

	var keypath = owner.root.viewmodel.getKeypath( ref, owner );

	if ( callback ) {
		callback( keypath );
	}

	return keypath;
}

export function isSpecialResolver ( ref ) {
	return ref.charAt( 0 ) === '@';
}

export function isIndexResolver ( owner, ref ) {
	return findIndexRefs( owner.parentFragment, ref );
}
