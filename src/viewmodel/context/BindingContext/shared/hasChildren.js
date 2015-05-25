export function hasChildFor ( value, key ) {
	return hasKeys( value ) && ( key in value );
}

export function hasKeys ( value ) {
	if ( value == null ) {
		return false;
	}
	return typeof value === 'object' || typeof value === 'function';
}
