import { isObject, isFunction } from 'utils/is';
import { assign } from 'utils/object';

const onceOptions = { init: false, once: true };

export default function observeOnce ( keypath, callback, options ) {
	if ( isObject( keypath ) || isFunction( keypath ) ) {
		options = assign( callback || {}, onceOptions );
		return this.observe( keypath, options );
	}

	options = assign( options || {}, onceOptions );
	return this.observe( keypath, callback, options );
}
