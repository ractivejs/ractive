define([
	'config/types',
	'render/DomFragment/Section/reassignFragment',
	'shared/processDeferredUpdates'
], function (
	types,
	reassignFragment,
	processDeferredUpdates
) {

	'use strict';

	return function ( root, section, start, end, by ) {
		var i, fragment, indexRef, oldIndex, newIndex, oldKeypath, newKeypath;

		indexRef = section.descriptor.i;

		for ( i=start; i<end; i+=1 ) {
			fragment = section.fragments[i];

			// If this fragment was rendered with innerHTML, we have nothing to do
			// TODO a less hacky way of determining this
			if ( fragment.html ) {
				continue;
			}

			oldIndex = i - by;
			newIndex = i;

			oldKeypath = section.keypath + '.' + ( i - by );
			newKeypath = section.keypath + '.' + i;

			// change the fragment index
			fragment.index += by;

			reassignFragment( fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
		}

		processDeferredUpdates( root );
	};
	

});