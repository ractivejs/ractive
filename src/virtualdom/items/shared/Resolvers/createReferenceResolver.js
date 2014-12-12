import ReferenceResolver from './ReferenceResolver';
import SpecialResolver from './SpecialResolver';
import IndexResolver from './IndexResolver';
import findIndexRefs from './findIndexRefs';

export default function createReferenceResolver ( owner, ref, callback ) {
	var indexRef;

	if ( ref.charAt( 0 ) === '@' ) {
		return new SpecialResolver( owner, ref, callback );
	}

	if ( indexRef = findIndexRefs( owner.parentFragment, ref ) ) {
		return new IndexResolver( owner, indexRef, callback );
	}

	return new ReferenceResolver( owner, ref, callback );
}
