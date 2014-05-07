import types from 'config/types';

export default function Fragment$isSimple () {
	var i, item, containsInterpolator;

	if ( this.simple !== undefined ) {
		return this.simple;
	}

	i = this.items.length;
	while ( i-- ) {
		item = this.items[i];
		if ( item.type === types.TEXT ) {
			continue;
		}

		// we can only have one interpolator and still be self-updating
		if ( item.type === types.INTERPOLATOR ) {
			if ( containsInterpolator ) {
				return false;
			} else {
				containsInterpolator = true;
				continue;
			}
		}

		// anything that isn't text or an interpolator (i.e. a section)
		// and we can't self-update
		return ( this.simple = false );
	}

	return ( this.simple = true );
}
