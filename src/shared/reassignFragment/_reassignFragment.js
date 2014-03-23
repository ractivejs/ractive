define([
	'circular',
	'config/types',
	'shared/reassignFragment/utils/assignNewKeypath',
	'shared/reassignFragment/reassignMustache',
	'shared/reassignFragment/reassignElement',
	'shared/reassignFragment/reassignComponent'
], function (
	circular,
	types,
	assignNewKeypath,
	reassignMustache,
	reassignElement,
	reassignComponent
) {

	'use strict';

	var reassignFragment = function ( fragment, indexRef, newIndex, oldKeypath, newKeypath ) {
		var i, item, query;

		// If this fragment was rendered with innerHTML, we have nothing to do
		// TODO a less hacky way of determining this
		if ( fragment.html !== undefined ) {
			return;
		}

		// assign new context keypath if needed
		assignNewKeypath(fragment, 'context', oldKeypath, newKeypath);

		if ( fragment.indexRefs
			&& fragment.indexRefs[ indexRef ] !== undefined
			&& fragment.indexRefs[ indexRef ] !== newIndex) {
			fragment.indexRefs[ indexRef ] = newIndex;
		}

		i = fragment.items.length;
		while ( i-- ) {
			item = fragment.items[i];

			switch ( item.type ) {
				case types.ELEMENT:
				reassignElement( item, indexRef, newIndex, oldKeypath, newKeypath );
				break;

				case types.PARTIAL:
				reassignFragment( item.fragment, indexRef, newIndex, oldKeypath, newKeypath );
				break;

				case types.COMPONENT:
				reassignComponent( item, indexRef, newIndex, oldKeypath, newKeypath );
				if ( query = fragment.root._liveComponentQueries[ item.name ] ) {
					query._makeDirty();
				}
				break;

				case types.SECTION:
				case types.INTERPOLATOR:
				case types.TRIPLE:
				reassignMustache( item, indexRef, newIndex, oldKeypath, newKeypath );
				break;
			}
		}
	};

	return circular.reassignFragment = reassignFragment;

});
