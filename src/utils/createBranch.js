var numeric = /^\s*[0-9]+\s*$/;

export default function ( key ) {
	return numeric.test( key ) ? [] : {};
}
