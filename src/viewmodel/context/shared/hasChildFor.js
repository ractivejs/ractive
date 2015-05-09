export default function hasChildFor ( value, key ) {
	if ( value == null ) {
		return false;
	}

	const hasKeys = typeof value === 'object' || typeof value === 'function';
	return hasKeys && ( key in value );
}
