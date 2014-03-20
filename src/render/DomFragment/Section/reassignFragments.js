define([
	'render/DomFragment/Section/reassignFragment'
], function (
	reassignFragment
) {

	'use strict';

	return function ( section, start, end, by ) {

		//nothing to do if only end of array was modified...
		//push
		if( start + by === end ) { return; }
		//pop
		if( start === end ) { return; }

		var i, fragment, indexRef, oldIndex, newIndex, oldKeypath, newKeypath;

		indexRef = section.descriptor.i;

		for ( i=start; i<end; i+=1 ) {
			fragment = section.fragments[i];

			oldIndex = i - by;
			newIndex = i;

			oldKeypath = section.keypath + '.' + ( i - by );
			newKeypath = section.keypath + '.' + i;

			// change the fragment index
			fragment.index += by;

			reassignFragment( fragment, indexRef, newIndex, oldKeypath, newKeypath );
		}
	};


});
