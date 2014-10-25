import ReferenceResolver from 'virtualdom/items/shared/Resolvers/ReferenceResolver';
import SpecialResolver from 'virtualdom/items/shared/Resolvers/SpecialResolver';
import IndexResolver from 'virtualdom/items/shared/Resolvers/IndexResolver';

export default function createReferenceResolver ( owner, ref, callback ) {
	var indexRefs, index;

	if ( ref.charAt( 0 ) === '@' ) {
		return new SpecialResolver( owner, ref, callback );
	}

	indexRefs = owner.parentFragment.indexRefs;
	if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
		return new IndexResolver( owner, ref, callback );
	}

	return new ReferenceResolver( owner, ref, callback );
}