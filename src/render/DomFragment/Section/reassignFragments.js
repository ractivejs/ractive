define([], function () {

	'use strict';

	return function ( section, start, end, by ) {

		var i, fragment, indexRef, oldKeypath, newKeypath;

		indexRef = section.descriptor.i;

		for ( i=start; i<end; i+=1 ) {
			fragment = section.fragments[i];

			oldKeypath = section.keypath + '.' + ( i - by );
			newKeypath = section.keypath + '.' + i;

			// change the fragment index
			fragment.index = i;
			fragment.reassign( indexRef, i, oldKeypath, newKeypath );
		}
	};


});
