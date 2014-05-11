export default function ( section, start, end, by ) {

	var i, fragment, indexRef, oldKeypath, newKeypath;

	indexRef = section.template.i;

	for ( i = start; i < end; i += 1 ) {
		fragment = section.fragments[i];

		oldKeypath = section.keypath + '.' + ( i - by );
		newKeypath = section.keypath + '.' + i;

		// change the fragment index
		fragment.index = i;
		fragment.rebind( indexRef, i, oldKeypath, newKeypath );
	}
}
