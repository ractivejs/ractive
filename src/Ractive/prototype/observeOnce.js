import { isObject } from 'utils/is';
import { extend } from 'utils/object';

const onceOptions = { init: false, once: true };

export default function observeOnce ( keypath, callback, options ) {
	if ( isObject( keypath ) || typeof keypath === 'function' ) {
		options = extend( callback || {}, onceOptions );
		return this.observe( keypath, options );
	}

	options = extend( options || {}, onceOptions );
	return this.observe( keypath, callback, options );
}
