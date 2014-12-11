import ReferenceResolver from 'virtualdom/items/shared/Resolvers/ReferenceResolver';
import SpecialResolver from 'virtualdom/items/shared/Resolvers/SpecialResolver';
import IndexResolver from 'virtualdom/items/shared/Resolvers/IndexResolver';
import findIndexRefs from 'virtualdom/items/shared/Resolvers/findIndexRefs';

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
